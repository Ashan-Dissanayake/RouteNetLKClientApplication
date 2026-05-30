import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  GRN_DATA_EXPORT_META,
  GRN_FILTER_FORM_META,
  GRN_MAIN_FORM_META,
  GRN_TABLE_META
} from '../model/grn.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {Grn} from '../entity/grn';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {GrnFacadeService} from '../service/util/grnfacade.service';
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
import {GrnMetadata} from '../model/grn.metadata.model';
import {GrnFormService} from '../service/util/grnfrom.service';
import {GrnMetadataService} from '../service/util/grn.metadata.service';

const NON_EDITABLE_STATUSES = ['received', 'partially received'];

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
  standalone:true,
  providers: [
    GrnFacadeService,
    GrnFormService,
    GrnMetadataService,
  ],
})

export class GrnComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns    = GRN_TABLE_META;
  protected readonly filterFormMeta  = GRN_FILTER_FORM_META;
  protected readonly mainFormMeta    = GRN_MAIN_FORM_META;
  protected readonly exportMeta      = GRN_DATA_EXPORT_META;
  // No create, no bulk-deactivate in this module
  protected readonly actionPanelConfig = buildActionPanel({ exclude: ['create', 'bulk-deactivate'] });

  // ===== Streams =====
  protected readonly grns$:     Observable<Grn[]>;
  protected readonly metadata$: Observable<GrnMetadata>;
  protected readonly loading$:  Observable<boolean>;
  protected readonly error$:    Observable<any>;

  // ===== UI state =====
  protected activeRow:    Grn | null = null;
  protected selectedRows  = new Set<Grn>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$        = new Subject<void>();
  private currentMetadata: GrnMetadata | null = null;

  constructor(
    private facade:      GrnFacadeService,
    private formService: GrnFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.grns$     = this.facade.grns$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize GRN module.', err),
      });

    // Build forms once real metadata arrives — skip EMPTY_GRN_METADATA
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

  protected onRowClick(row: Grn): void  { this.activeRow = row; }
  protected onCloseDetailView(): void   { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.grns$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions =====

  protected onRowAction(action: string, row: Grn): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
    };
    if (actions[action]) actions[action]();
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  // ===== Edit =====
  //
  // Status guard: Received and Partially Received GRNs cannot be edited.
  // This is a UI-level guard. The component owns it because it is
  // a UI decision (show a message) not a domain rule (the domain
  // rule lives in the backend).

  private openEditForm(row: Grn): void {
    const status = row.grnstatus?.name?.toLowerCase() ?? '';

    if (NON_EDITABLE_STATUSES.includes(status)) {
      this.dialog.showMessage({
        heading: 'Edit not allowed',
        message: 'Cannot edit a GRN that has already been Received or Partially Received.',
      });
      return;
    }

    if (!this.currentMetadata) return;

    // FormService builds a fresh form and patches it with the row
    this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);

    this.dialog.showFormPopup({
      heading: 'Edit GRN',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else {
        // Restore a clean main form on cancel
        this.mainForm = this.formService.buildMainForm(this.currentMetadata!);
      }
    });
  }

  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('GRN updated successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to update GRN', message: err.errorMessage }),
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
      title: 'GRN Details', mode: 'table',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'grn.xlsx');
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }
}
