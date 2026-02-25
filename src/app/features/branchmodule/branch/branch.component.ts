import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {BranchFacadeService} from '../branchfacade.service';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {Branch} from '../model/branch';
import {BranchStatus} from '../model/branchstatus';
import {BranchType} from '../model/branchtype';
import {ButtonClickEvent, ButtonPanelComponent } from '../../../shared/component/button/button-panel/button-panel.component';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {DialogService} from '../../../core/dialog.service';
import {MatButton} from '@angular/material/button';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {MatDivider} from '@angular/material/divider';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  BRANCH_DATA_EXPORT_META,
  BRANCH_FILTER_FORM_META,
  BRANCH_MAIN_FORM_META,
  BRANCH_TABLE_META
} from '../branch.meta';
import {RegionalOffice} from '../model/regionaloffice';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
    FormsModule,
  ],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
})
export class BranchComponent implements OnInit, OnDestroy {

  // ===== Metadata & Configurations =====
  protected readonly tableColumns = BRANCH_TABLE_META;
  protected readonly filterFormMeta = BRANCH_FILTER_FORM_META;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly mainFormMeta = BRANCH_MAIN_FORM_META;
  protected readonly exportMeta = BRANCH_DATA_EXPORT_META;

  // ===== Form Controls =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  // --- Data ---
  protected branches!: Branch[];
  protected branchStatuses!: BranchStatus[];
  protected branchTypes!: BranchType[];
  protected regionalOffices!: RegionalOffice[];
  protected regexRules!: any;

  protected dataInitialized = false;

  protected selectedRows = new Set<Branch>();
  protected activeBranch: Branch | null = null;

  @ViewChild('printSection', {static: false}) printSectionRef!: ElementRef;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilderService: FormbuilderService,
    private branchFacadeService: BranchFacadeService,
    private dialogService: DialogService
  ) {
  }

  // ===== Lifecycle =====
  ngOnInit() {
    this.initialize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  private initialize(): void {
    forkJoin({
      branchStatuses: this.branchFacadeService.loadBranchStatuses(),
      branchTypes: this.branchFacadeService.loadBranchTypes(),
      regionalOffices: this.branchFacadeService.loadRegionalOffices(),
      regexes: this.branchFacadeService.loadStaticRegexes()
    }).subscribe({
      next: data => this.loadMetaData(data),
      error: (err) => this.dialogService.showError('Failed to load metadata.', err),
      complete:()=>{
        this.loadTable();
        this.createMainForm();
        this.createFilterForm();
      }
    });
  }

  private loadMetaData(data: any): void {
    this.branchStatuses = data.branchStatuses;
    this.branchTypes = data.branchTypes;
    this.regionalOffices = data.regionalOffices;
    this.regexRules = data.regexes;
  }

  private createFilterForm(): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      ssbranchstatus: this.branchStatuses
    });
    this.onFilterFormChanged();
  }

  private createMainForm(): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      branchtype: this.branchTypes,
      regionaloffice: this.regionalOffices,
      branchstatus: this.branchStatuses,
      regexes: this.regexRules
    });

  }

  // ===== Data Loading =====
  private loadTable(): void {
    this.branchFacadeService.loadBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log(data)
        this.branches = data
      });
  }


  // ===== CRUD =====
  private openMainForm(): void {
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Branch' : 'Create Branch',
      form: this.mainForm,
      meta: this.mainFormMeta
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = formData.id
      ? this.branchFacadeService.updateBranch(formData)
      : this.branchFacadeService.createBranch(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () =>this.dialogService.showSuccess('Branch saved successfully.'),
      error: (err) => this.dialogService.showError('Failed to save branch.', JSON.stringify(err)),
      complete:()=>{
        this.loadTable();
        this.createMainForm();
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private edit(row: Branch): void {
    this.mainForm.patchValue(row);
    this.openMainForm();
  }

  private deactivateSelectedRows() {
    const toDeactivate = Array.from(this.selectedRows);
    this.dialogService.showConfirmation({
      heading: "Deactivation",
      message: "Are sure ?"
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.branchFacadeService.deleteBranches(toDeactivate)
        ?.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Selected branches deactivated.');
            this.selectedRows.clear();
            this.loadTable();
          },
          error: (err) => this.dialogService.showError('Failed to deactivate branches.', err)
        });
    })
  }

  // ===== Export Operations =====
  private toPdf() {
    if (this.selectedRows.size > 0) {
      this.dialogService.showPrintDialog({
        title: 'Branch Details',
        mode: 'table',
        data: Array.from(this.selectedRows),
        columns: this.exportMeta
      }).subscribe((result) => {
        if (result) {
          this.selectedRows = new Set<Branch>();
        }
      });
    } else {
      this.dialogService.showWarning('Please select at least one record to print.');
    }
  }

  private toExcel(): void {
    const selectedArray = Array.from(this.selectedRows);
    let isExported = exportToExcel(
      selectedArray,
      this.exportMeta,
      'selected-branches.xlsx'
    );

    if (!isExported) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return
    }
  }

// ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeBranch = row;
  }

  protected onCloseDetailView(): void {
    this.activeBranch = null;
  }

  protected onRowAction(action: string, row: any) {
    if (action === 'edit') this.edit(row);
  }

  // Selection Handling
  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.branches.forEach(row => this.selectedRows.add(row));
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filters: Record<string, any>) => {
        this.branchFacadeService.searchBranches(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.branches = data);
      });
  }

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'create': () => this.openMainForm(),
    'export-pdf': () => this.toPdf(),
    'export-excel': () => this.toExcel(),
    'bulk-deactivate': () => this.deactivateSelectedRows(),
    'clear-search': () => this.filterForm.reset()
  };

  protected onActionTriggered(event: ButtonClickEvent) {
    const handler = this.actionHandlers[event.type];
    if (handler) handler();
    else this.dialogService.showError(`No handler defined for action: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent) {
    const dropdownTypes = ['export-pdf', 'export-excel'];
    if (dropdownTypes.includes(event.type)) {
      this.actionHandlers[event.type]?.();
    } else {
      this.dialogService.showWarning(`Unhandled dropdown action: ${event.type}`);
    }
  }

}

