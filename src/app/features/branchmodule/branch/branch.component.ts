import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../shared/form/formbuilder.service';
import {BranchFacadeService} from '../branchfacade.service';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {Branch} from '../model/branch';
import {BranchStatus} from '../model/branchstatus';
import {BranchType} from '../model/branchtype';
import {District} from '../model/district';
import {Province} from '../model/province';
import {ActionPanelMeta, DashBoardMeta, FilterMeta, FormMeta, TableMeta} from '../branch.meta';
import {StatsGridComponent} from '../../../shared/component/stats-grid/stats-grid.component';
import {
  ButtonAction,
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button-panel/button-panel.component';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/form/dynamic-field.component';
import {DialogService} from '../../../core/dialog.service';
import {MatButton} from '@angular/material/button';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {MatDivider} from '@angular/material/divider';
import {MatList,} from '@angular/material/list';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    StatsGridComponent,
    ButtonPanelComponent,
    NgForOf,
    DynamicFieldComponent,
    NgIf,
    DataTableComponent,
    TableCellDirective,
    MatButton,
    SideViewComponent,
    MatDivider,
    DatePipe,
    NgClass,
    MatIcon,
  ],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
})
export class BranchComponent implements OnInit,OnDestroy {

  // --- Metadata ---
  readonly tableColumnsMeta = TableMeta;
  readonly dashboardStatsMeta = DashBoardMeta;
  readonly actionPanelMeta = ActionPanelMeta;
  readonly mainFormDefinition = FormMeta;
  readonly filterFormDefinition = FilterMeta;

  // --- Forms ---
  branchDataForm: FormGroup = new FormGroup({});
  branchSearchForm: FormGroup = new FormGroup({});

  // --- Data ---
  branchList!: Branch[];
  branchStatusList!: BranchStatus[];
  branchTypeList!: BranchType[];
  districtList!: District[];
  provinceList!: Province[];
  regexValidators!: any;

  isInitialDataLoaded  = false;
  selectedRows = new Set<any>();

  selectedRow: any = null;


  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
    private branchFacade: BranchFacadeService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.loadInitialMetaData();
    this.actionPanelMeta.forEach(btn => {
      if (btn.type === 'bulk-deactivate') {
        btn.disabled = () => this.selectedRows.size === 0;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialization & Data Loading
  private loadInitialMetaData() {
    forkJoin({
      branchStatuses: this.branchFacade.loadBranchStatuses(),
      branchTypes: this.branchFacade.loadBranchTypes(),
      districts: this.branchFacade.loadDistricts(),
      provinces: this.branchFacade.loadProvinces(),
      regexes: this.branchFacade.loadRegexes()
    }).subscribe({
      next: data => this.handleInitialMetaData(data),
      error: err => this.dialogService.showMessage({
        heading: 'Error',
        message: `Failed to save branch. ${err.message || err}`
      })
    });
  }

  private handleInitialMetaData(data: any) {
    this.branchStatusList = data.branchStatuses;
    this.branchTypeList = data.branchTypes;
    this.districtList = data.districts;
    this.provinceList = data.provinces;
    this.regexValidators = data.regexes;

    this.buildForms();
    this.isInitialDataLoaded = true;
    this.loadBranchTableData();
    this.subscribeToSearchFormChanges();
  }

  private buildForms() {
    // Main Form
    this.branchDataForm = this.formBuilder.build(this.mainFormDefinition, {
      branchtype: this.branchTypeList,
      branchstatus: this.branchStatusList,
      branchcoverages: this.districtList,
      regexes: this.regexValidators
    });

    // Search Form
    this.branchSearchForm = this.formBuilder.build(this.filterFormDefinition, {
      ssbranchstatus: this.branchStatusList
    });
  }

  private loadBranchTableData() {
    this.branchFacade.loadBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.branchList = data);
  }

  // --- Search/Filter Logic ---
  private subscribeToSearchFormChanges() {
    this.branchSearchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchData => {
        this.branchFacade.searchBranches(searchData)
          .pipe(takeUntil(this.destroy$))
          .subscribe(branches => this.branchList = branches);
      });
  }

  // Form Popup & Submit
  openBranchFormPopup() {
    this.dialogService.showFormPopup({
      heading: this.branchDataForm.value.id ? 'Edit Details' : 'Create New Branch',
      form: this.branchDataForm,
      meta: this.mainFormDefinition
    }).subscribe(result => {
      if (result) this.handleBranchFormSubmit(result);
      else this.branchDataForm.reset();
    });
  }

  private handleBranchFormSubmit(branchData: any) {
    const obs$ = branchData.id
      ? this.branchFacade.updateBranch(branchData)
      : this.branchFacade.createBranch(branchData);

    obs$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showMessage({ heading: 'Success', message: 'Branch saved successfully' });
        this.loadBranchTableData();
        this.branchDataForm.reset();
      },
      error: err => this.dialogService.showMessage({
        heading: 'Error',
        message: err.message
      })
    });
  }

  prepareFormForEdit(row: Branch) {
    this.branchDataForm.patchValue(row);
    this.openBranchFormPopup();
  }

  // Table Row Actions
  onRowDataClick(row: any): void {
    this.selectedRow = row;
  }

  closeSideView(): void {
    this.selectedRow = null;
  }

  onRowActionExecuted(action: string, row: any) {
    if (action === 'edit') this.prepareFormForEdit(row);
  }

  // Action Panel Handlers
  private actionHandlers: Record<string, () => void> = {
    'create': () => this.openBranchFormPopup(),
    'export-csv': () => console.log('Export CSV called'),
    'export-excel': () => console.log('Export Excel called'),
    'bulk-deactivate': () => this.deleteSelected(),
    'clear-search': () => this.branchSearchForm.reset()
  };

  onActionPanelClick(event: ButtonClickEvent) {
    const handler = this.actionHandlers[event.type];
    if (handler) handler();
    else console.warn(`No handler defined for action: ${event.type}`);
  }

  onDropdownOnlyClick(event: ButtonClickEvent) {
    const dropdownTypes = ['export-csv', 'export-excel'];
    if (dropdownTypes.includes(event.type)) {
      console.log(`Dropdown action executed: ${event.type}`);
      this.actionHandlers[event.type]?.();
    } else {
      console.warn(`Unhandled dropdown action: ${event.type}`);
    }
  }

  // Selection Handling
  onRowCheckboxChanged(event: CheckboxEvent<any>) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.branchList.forEach(row => this.selectedRows.add(row));
  }

  deleteSelected() {
    const toDelete = Array.from(this.selectedRows);
    this.dialogService.showConfirmation({heading:"Deactivation",message:"Are sure ?"})
      .subscribe(confirmed=>{
        if (confirmed){
          const obs$ = this.branchFacade.deleteBranches(toDelete);
          obs$?.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.dialogService.showMessage({ heading: 'Success', message: 'Branch Deactivated successfully' });
              this.selectedRows.clear();
              this.loadBranchTableData();
            },
            error: err => this.dialogService.showMessage({
              heading: 'Error',
              message: `Failed to Deactivate branch. ${err.message || err}`
            })
          });
        }
      })

  }

}

