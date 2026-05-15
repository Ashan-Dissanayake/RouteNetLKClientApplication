import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  PART_REQUEST_DATA_EXPORT_META,
  PART_REQUEST_FILTER_FORM_META,
  PART_REQUEST_MAIN_FORM_META,
  PART_REQUEST_TABLE_META
} from '../partrequest.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {async,Observable, Subject, take, takeUntil} from 'rxjs';
import {PartRequest} from '../entity/partrequest';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {PartRequestFacadeService} from '../partrequestfacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatProgressBar} from '@angular/material/progress-bar';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {MatChip} from '@angular/material/chips';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-partrequest',
  imports: [
    AsyncPipe,
    ButtonPanelComponent,
    DataTableComponent,
    DynamicFieldComponent,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatDivider,
    MatIcon,
    MatProgressBar,
    NgForOf,
    NgIf,
    SideViewComponent,
    TableCellDirective,
    ReactiveFormsModule,
    NgClass,
    MatChip,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './partrequest.component.html',
  styleUrl: './partrequest.component.scss',
  standalone: true
})
export class PartRequestComponent implements OnInit, OnDestroy  {
  // ===== Meta Data =====
  protected readonly tableColumns = PART_REQUEST_TABLE_META;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly filterFormMeta = PART_REQUEST_FILTER_FORM_META;
  protected readonly mainFormMeta = PART_REQUEST_MAIN_FORM_META;
  protected readonly exportMeta = PART_REQUEST_DATA_EXPORT_META;

  // ===== Reactive State =====
  protected partRequests$: Observable<PartRequest[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  protected readonly async = async;

  // ===== UI State =====
  protected activePartRequest: PartRequest | null = null;
  protected selectedRows = new Set<PartRequest>();

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  constructor(
    private partRequestFacade: PartRequestFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.partRequests$ = this.partRequestFacade.partRequests$;
    this.metadata$ = this.partRequestFacade.metadata$;
    this.loading$ = this.partRequestFacade.loading$;
    this.error$ = this.partRequestFacade.error$;
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
    this.partRequestFacade.initializePartRequestModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize partRequestFacade module.', err)
      });
  }

  // ===== Form creation =====
  private createFilterForm(metadata: any): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      sspartrequeststatus: metadata.partRequestStatuses,
    });
    this.onFilterFormChanged();
  }

  private createMainForm(metadata: any): void {
    const lineField = PART_REQUEST_MAIN_FORM_META.find(f => f.name === 'partrequestitems');
    if (lineField?.innerTableConfig) {
      lineField.innerTableConfig.dataMap = { part: metadata.parts };
    }

    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      branch: metadata.branches,
      partrequeststatus: metadata.partRequestStatuses,
      partrequestitems: metadata.parts,
    });
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => this.partRequestFacade.filterPartRequests(filters));
  }

  // ===== Row & Selection Handlers =====
  protected onRowClick(row: PartRequest): void {
    this.activePartRequest = row;
  }

  protected onRowAction(action: string, row: PartRequest) {
    if (action === 'approved') this.approvedPartRequest(row);
    if (action === 'rejected') this.rejectPartRequest(row);
  }

  protected reload(): void { this.partRequestFacade.reloadPartRequests(); }

  protected onCloseDetailView(): void {
    this.activePartRequest = null;
  }

  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) {
      this.partRequests$.pipe(take(1)).subscribe(rows => rows.forEach(r => this.selectedRows.add(r)));
    }
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit part' : 'Create part',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width:'900px'
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = this.partRequestFacade.createPartRequest(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('part saved successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to save part', message: err.errorMessage }),
      complete: () => {
        this.reload();
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private approvedPartRequest(partRequest: PartRequest): void {
    this.partRequestFacade.approvedPartRequest(partRequest).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('part request approved successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to approve part request', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activePartRequest?.id === partRequest.id) this.activePartRequest = null;
      }
    });
  }

  private rejectPartRequest(partRequest: PartRequest): void {
    this.partRequestFacade.rejectPartRequest(partRequest).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('part request rejected successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to reject part request', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activePartRequest?.id === partRequest.id) this.activePartRequest = null;
      }
    });
  }

  // ===== Export =====
  protected toPdf(): void {
    this.partRequests$.pipe(take(1)).subscribe(() => {
      if (this.selectedRows.size > 0) {
        this.dialogService.showPrintDialog({
          width: '1500px',
          height: '650px',
          title: 'Part Request Details',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'part-request.xlsx');
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
