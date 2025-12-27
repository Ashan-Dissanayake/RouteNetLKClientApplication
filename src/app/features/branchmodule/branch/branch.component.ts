import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {BranchFacadeService} from '../branchfacade.service';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {Branch} from '../model/branch';
import {BranchStatus} from '../model/branchstatus';
import {BranchType} from '../model/branchtype';
import {District} from '../model/district';
import {Province} from '../model/province';
import {FilterMeta, FormMeta, PrintTableMeta, TableMeta} from '../branch.meta';
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
import {FormUtils} from '../../../shared/component/form/form-util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';

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
  protected readonly tableColumns = TableMeta;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly branchFormMeta = FormMeta;
  protected readonly branchFilterMeta = FilterMeta;
  protected readonly printableColumns = PrintTableMeta;

  // ===== Form Controls =====
  protected branchForm: FormGroup = new FormGroup({});
  protected branchFilterForm: FormGroup = new FormGroup({});

  // --- Data ---
  protected branches!: Branch[];
  protected branchStatuses!: BranchStatus[];
  protected branchTypes!: BranchType[];
  protected districts!: District[];
  protected provinces!: Province[];
  protected regexRules!: any;

  protected dataInitialized = false;
  protected selectedRows = new Set<Branch>();
  protected activeBranch: Branch | null = null;

  @ViewChild('printSection', {static: false}) printSectionRef!: ElementRef;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
    private branchFacade: BranchFacadeService,
    private dialogService: DialogService
  ) {
  }

  // ===== Lifecycle =====
  ngOnInit() {
    this.initializeMetadata();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  private initializeMetadata(): void {
    forkJoin({
      branchStatuses: this.branchFacade.loadBranchStatuses(),
      branchTypes: this.branchFacade.loadBranchTypes(),
      districts: this.branchFacade.loadDistricts(),
      provinces: this.branchFacade.loadProvinces(),
      regexes: this.branchFacade.loadStaticRegexes()
    }).subscribe({
      next: data => this.handleMetadataLoad(data),
      error: (err) => this.dialogService.showError('Failed to load branch metadata.', err)
    });
  }

  private handleMetadataLoad(data: any): void {
    this.branchStatuses = data.branchStatuses;
    this.branchTypes = data.branchTypes;
    this.districts = data.districts;
    this.provinces = data.provinces;
    this.regexRules = data.regexes;

    this.initializeForms();
    this.dataInitialized = true;
    this.loadBranchTable();
    this.subscribeToFilterChanges();
  }

  private initializeForms(): void {
    this.branchForm = this.formBuilder.build(this.branchFormMeta, {
      branchtype: this.branchTypes,
      branchstatus: this.branchStatuses,
      branchcoverages: this.districts,
      regexes: this.regexRules
    });

    this.branchFilterForm = this.formBuilder.build(this.branchFilterMeta, {
      ssbranchstatus: this.branchStatuses
    });
  }

  // ===== Data Loading =====
  private loadBranchTable(): void {
    this.branchFacade.loadBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.branches = data);
  }

  // ===== Filtering =====
  private subscribeToFilterChanges(): void {
    this.branchFilterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filters: Record<string, any>) => {
        this.branchFacade.searchBranches(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.branches = data);
      });
  }

  // ===== CRUD =====
  protected openBranchForm(): void {
    this.dialogService.showFormPopup({
      heading: this.branchForm.value.id ? 'Edit Branch' : 'Create Branch',
      form: this.branchForm,
      meta: this.branchFormMeta
    }).subscribe(formData => {
      if (formData) this.saveBranch(formData);
      else FormUtils.resetForm(this.branchForm);
    });
  }

  private saveBranch(formData: any): void {
    const operation$ = formData.id
      ? this.branchFacade.updateBranch(formData)
      : this.branchFacade.createBranch(formData);

    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showSuccess('Branch saved successfully.');
        this.loadBranchTable();
        FormUtils.resetForm(this.branchForm);
      },
      error: (err) => this.dialogService.showError('Failed to save branch.', JSON.stringify(err))
    });
  }

  protected editBranch(row: Branch): void {
    this.branchForm.patchValue(row);
    this.openBranchForm();
  }

  protected deactivateSelectedBranches() {
    const toDeactivate = Array.from(this.selectedRows);
    this.dialogService.showConfirmation({
      heading: "Deactivation",
      message: "Are sure ?"
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.branchFacade.deleteBranches(toDeactivate)
        ?.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Selected branches deactivated.');
            this.selectedRows.clear();
            this.loadBranchTable();
          },
          error: (err) => this.dialogService.showError('Failed to deactivate branches.', err)
        });
    })
  }

// ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeBranch = row;
  }

  protected closeBranchDetails(): void {
    this.activeBranch = null;
  }

  protected onRowAction(action: string, row: any) {
    if (action === 'edit') this.editBranch(row);
  }


  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'create': () => this.openBranchForm(),
    'export-pdf': () => this.exportSelectedToPdf(),
    'export-excel': () => this.exportSelectedToExcel(),
    'bulk-deactivate': () => this.deactivateSelectedBranches(),
    'clear-search': () => this.branchFilterForm.reset()
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

  // ===== Export Operations =====
  protected exportSelectedToPdf() {
    if (this.selectedRows.size > 0) {
      this.dialogService.showPrintDialog({
        title: 'Branch Details',
        mode: 'table',
        data: Array.from(this.selectedRows),
        columns: this.printableColumns
      }).subscribe((result) => {
        if (result) {
          this.selectedRows = new Set<Branch>();
        }
      });
    } else {
      this.dialogService.showWarning('Please select at least one record to print.');
    }
  }


  protected exportSelectedToExcel(): void {
    const selectedArray = Array.from(this.selectedRows);
    let isExported = exportToExcel(
      selectedArray,
      this.printableColumns,
      'selected-branches.xlsx'
    );

    if (!isExported) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return
    }
  }

  // Selection Handling
  onRowCheckboxChanged(event: CheckboxEvent<any>) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.branches.forEach(row => this.selectedRows.add(row));
  }


}

