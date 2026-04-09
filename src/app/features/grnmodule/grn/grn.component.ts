import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  GRN_DATA_EXPORT_META,
  GRN_FILTER_FORM_META,
  GRN_MAIN_FORM_META,
  GRN_TABLE_META
} from '../grn.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {async, Observable, Subject, take, takeUntil} from 'rxjs';
import {Grn} from '../entity/grn';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {GrnFacadeService} from '../grnfacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatChip} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
@Component({
  selector: 'app-grn',
  imports: [
    AsyncPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
    NgIf,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    DataTableComponent,
    MatChip,
    MatDivider,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass
  ],
  templateUrl: './grn.component.html',
  styleUrl: './grn.component.scss',
  standalone:true
})
export class GrnComponent implements OnInit, OnDestroy  {

  // ===== Meta Data =====
  protected readonly tableColumns = GRN_TABLE_META;
  protected readonly actionPanelConfig = buildActionPanel({exclude: ['create', 'bulk-deactivate']});
  protected readonly filterFormMeta = GRN_FILTER_FORM_META;
  protected readonly mainFormMeta = GRN_MAIN_FORM_META;
  protected readonly exportMeta = GRN_DATA_EXPORT_META;

  // ===== Reactive State =====
  protected grns$: Observable<Grn[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  protected readonly async = async;

  // ===== UI State =====
  protected activePartRequest: Grn | null = null;
  protected selectedRows = new Set<Grn>();

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  constructor(
    private grnFacade: GrnFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.grns$ = this.grnFacade.grns$;
    this.metadata$ = this.grnFacade.metadata$;
    this.loading$ = this.grnFacade.loading$;
    this.error$ = this.grnFacade.error$;
  }

  ngOnInit(): void {
    this.initializeModule();
    this.metadata$.pipe(takeUntil(this.destroy$)).subscribe(metadata => {
      this.createFilterForm(metadata);
      this.createMainForm(metadata);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeModule() {
    this.grnFacade.initializeGrnModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize GRN module.', err)
      });
  }

  // ===== Form creation =====
  private createFilterForm(metadata: any): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      ssgrnstatus: metadata.grnStatuses,
      sspartrequest: metadata.partRequests,
    });
    this.onFilterFormChanged();
  }

  private createMainForm(metadata: any): void {
    //M:n with addtional attributes
    const lineField = GRN_MAIN_FORM_META.find(f => f.name === 'grnpartrequestitems');
    if (lineField?.innerTableConfig) {
      lineField.innerTableConfig.dataMap = { partreqiestitems: metadata.parts };
    }

    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
     // branch: metadata.branches,
     // grnststatus: metadata.grnststatus,
      //partrequest: metadata.partrequest,
    });
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => this.grnFacade.filterGrns(filters));
  }

  // ===== Row & Selection Handlers =====
  protected onRowClick(row: Grn): void {
    this.activePartRequest = row;
  }

  protected reload(): void { this.grnFacade.reloadGrns(); }

  protected onCloseDetailView(): void {
    this.activePartRequest = null;
  }

  protected onRowAction(action: string, row: Grn) {
    if (action === 'edit') this.edit(row);
  }

  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) {
      this.grns$.pipe(take(1)).subscribe(rows => rows.forEach(r => this.selectedRows.add(r)));
    }
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit GRN' : 'Create GRN',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width:'900px'
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = this.grnFacade.updateGrn(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('GRN saved successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to save GRN', message: err.errorMessage }),
      complete: () => {
        this.reload();
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private edit(row: Grn): void {
    const status = row.grnstatus.name;
    if (status === 'Received'||status === 'Partially Received') {
      this.dialogService.showMessage({
        heading: 'Edit not allowed',
        message: 'Cannot edit a GRN that has already been Received or Partially Received.'
      });
      return;
    }
    this.mainForm.patchValue(row);
    this.openMainForm();
  }

  // ===== Export =====
  protected toPdf(): void {
    this.grns$.pipe(take(1)).subscribe(() => {
      if (this.selectedRows.size > 0) {
        this.dialogService.showPrintDialog({
          width: '1500px',
          height: '650px',
          title: 'Grn Details',
          mode: 'table',
          data: Array.from(this.selectedRows),
          columns: this.exportMeta
        }).subscribe(result => { if (result) this.selectedRows.clear(); });
      } else {
        this.dialogService.showWarning('Please select at least one record to print.');
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'grn.xlsx');
  }


  // ===== Action Panel =====
  protected actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.filterForm.reset(),
    'create': () => this.openMainForm(),
    'export-pdf': () => this.toPdf(),
    'export-excel': () => this.toExcel()
  };

  protected onActionTriggered(event: ButtonClickEvent) {
    const handler = this.actionHandlers[event.type];
    if (handler) handler();
    else this.dialogService.showWarning(`No handler defined for action: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent) {
    const dropdownTypes = ['export-pdf', 'export-excel'];
    if (dropdownTypes.includes(event.type)) {
      this.actionHandlers[event.type]?.();
    } else {
      this.dialogService.showWarning(`Unhandled dropdown action: ${event.type}`);
    }
  }
  // ===== TrackBy for optimization =====

  trackByField(index: number, field: any) {
    return field.key || index;
  }



}
