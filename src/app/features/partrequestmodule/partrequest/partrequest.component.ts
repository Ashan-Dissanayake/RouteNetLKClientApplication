import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  PART_REQUEST_DATA_EXPORT_META,
  PART_REQUEST_FILTER_FORM_META,
  PART_REQUEST_MAIN_FORM_META,
  PART_REQUEST_TABLE_META
} from '../model/partrequest.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {async, debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {PartRequest} from '../entity/partrequest';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {PartRequestFacadeService} from '../service/util/partrequestfacade.service';
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
import {PartRequestMetadata} from '../model/partrequest.metadata.model';
import {PartRequestFormService} from '../service/util/partrequestform.service';
import {PartRequestMetadataService} from '../service/util/partrequest.metadata.service';

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
  standalone: true,
  providers: [
    PartRequestFacadeService,
    PartRequestFormService,
    PartRequestMetadataService,
  ],
})
export class PartRequestComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns    = PART_REQUEST_TABLE_META;
  protected readonly filterFormMeta  = PART_REQUEST_FILTER_FORM_META;
  protected readonly mainFormMeta    = PART_REQUEST_MAIN_FORM_META;
  protected readonly exportMeta      = PART_REQUEST_DATA_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel();

  // ===== Streams =====
  protected readonly partRequests$: Observable<PartRequest[]>;
  protected readonly metadata$:     Observable<PartRequestMetadata>;
  protected readonly loading$:      Observable<boolean>;
  protected readonly error$:        Observable<any>;

  // ===== UI state =====
  protected activeRow:    PartRequest | null = null;
  protected selectedRows  = new Set<PartRequest>();
  protected selectedCount = 0;
  protected readonly async = async;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$         = new Subject<void>();
  private currentMetadata: PartRequestMetadata | null = null;

  constructor(
    private facade:      PartRequestFacadeService,
    private formService: PartRequestFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.partRequests$ = this.facade.partRequests$;
    this.metadata$      = this.facade.metadata$;
    this.loading$       = this.facade.loading$;
    this.error$         = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize part request module.', err),
      });
    this.facade.metadata$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(meta => {
      this.currentMetadata = meta;
      this.filterForm = this.formService.buildFilterForm(meta);
      this.mainForm   = this.formService.buildMainForm(meta);
      this.watchFilterForm();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter =====

  private watchFilterForm(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
    ).subscribe(values => this.facade.filter(values));
  }

  // ===== Row interaction =====

  protected onRowClick(row: PartRequest): void  { this.activeRow = row; }
  protected onCloseDetailView(): void           { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.partRequests$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions — status transitions =====

  protected onRowAction(action: string, row: PartRequest): void {
    const transitions: Record<string, [Observable<any>, string]> = {
      'approved': [this.facade.approve(row), 'Part request approved successfully.'],
      'rejected': [this.facade.reject(row),  'Part request rejected successfully.'],
    };

    const match = transitions[action];
    if (match) this.executeTransition(match[0], match[1], row);
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  private executeTransition(
    operation$: Observable<any>,
    successMessage: string,
    row: PartRequest,
  ): void {
    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess(successMessage),
      error:    err => this.dialog.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.activeRow?.id === row.id) this.activeRow = null;
      },
    });
  }

  // ===== Create =====

  private openCreateForm(): void {
    this.dialog.showFormPopup({
      heading: 'Create Part Request',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilder.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    this.facade.create(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Part request created successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to create part request', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      },
    });
  }

  // ===== Action panel =====

  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create':       () => this.openCreateForm(),
      'clear-search': () => this.formBuilder.resetForm(this.filterForm),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`No handler for: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'export-pdf':   () => this.toPdf(),
      'export-excel': () => this.toExcel(),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`Unhandled dropdown: ${event.type}`);
  }

  // ===== Export =====

  protected toPdf(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to print.');
      return;
    }
    this.dialog.showPrintDialog({
      width: '1500px', height: '650px',
      title: 'Part Request Details', mode: 'table',
      data: Array.from(this.selectedRows), columns: this.exportMeta,
    }).subscribe(result => {
      if (result) { this.selectedRows.clear(); this.selectedCount = 0; }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'part-requests.xlsx');
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }
}
