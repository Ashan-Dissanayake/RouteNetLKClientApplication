import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  PERMIT_EXPORT_META,
  PERMIT_FILTER_FORM_META,
  PERMIT_MAIN_FORM_META,
  PERMIT_TABLE_META
} from '../model/permit.meta';
import {PermitFacadeService} from '../service/util/permitfacade.service';
import {debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {Permit} from '../entity/permit';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {MatDivider} from '@angular/material/divider';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {PermitMetadata} from '../model/permit.metadata.model';
import {PermitFormService} from '../service/util/permitfrom.service';
import {PermitMetadataService} from '../service/util/permit.metadata.service';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';

@Component({
  selector: 'app-permit',
  imports: [
    DataTableComponent,
    MatCardTitle,
    NgIf,
    MatCardContent,
    MatCard,
    MatProgressBar,
    MatButton,
    AsyncPipe,
    TableCellDirective,
    MatIcon,
    SideViewComponent,
    ButtonPanelComponent,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    ReactiveFormsModule,
    NgFor
  ],
  templateUrl: './permit.component.html',
  styleUrl: './permit.component.scss',
  standalone:true,
  providers: [
    PermitFacadeService,
    PermitFormService,
    PermitMetadataService,
  ],
})
export class PermitComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns    = PERMIT_TABLE_META;
  protected readonly filterFormMeta  = PERMIT_FILTER_FORM_META;
  protected readonly mainFormMeta    = PERMIT_MAIN_FORM_META;
  protected readonly exportMeta    = PERMIT_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel();

  // ===== Streams =====
  protected readonly permits$:  Observable<Permit[]>;
  protected readonly metadata$: Observable<PermitMetadata>;
  protected readonly loading$:  Observable<boolean>;
  protected readonly error$:    Observable<any>;

  // ===== UI state =====
  protected activeRow:    Permit | null = null;
  protected selectedRows  = new Set<Permit>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$         = new Subject<void>();
  private currentMetadata: PermitMetadata | null = null;

  constructor(
    private facade:      PermitFacadeService,
    private formService: PermitFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.permits$  = this.facade.permits$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize permit module.', err),
      });

    // Build forms once real metadata arrives — skip EMPTY_PERMIT_METADATA
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

  protected onRowClick(row: Permit): void  { this.activeRow = row; }
  protected onCloseDetailView(): void      { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.permits$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions =====

  protected onRowAction(action: string, row: Permit): void {
    const actions: Record<string, () => void> = {
      'transfer': () => this.transferPermit(row),
    };
    if (actions[action]) actions[action]();
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  // ===== Transfer =====
  //
  // Transfer is a domain-level status transition on an existing permit.
  // The confirmation dialog lives here because showing UI feedback
  // is a component responsibility. The actual operation delegates
  // to the facade.

  private transferPermit(row: Permit): void {
    this.dialog.showConfirmation({
      heading: 'Permit Transfer',
      message: `Are you sure you want to transfer Permit ${row.number}?`,
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.facade.transfer(row.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next:     () => this.dialog.showSuccess('Permit transferred successfully.'),
          error:    err => this.dialog.showError('Failed to transfer permit.', err),
          complete: () => this.facade.reload(),
        });
    });
  }

  // ===== Create =====
  private openCreateForm(): void {
    this.dialog.showFormPopup({
      heading: 'Create Permit',
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
      next:     () => this.dialog.showSuccess('Permit created successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to create Permit', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        this.formBuilder.resetForm(this.mainForm);
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
      width:   '1500px',
      height:  '650px',
      title:   'Permit Details',
      mode:    'table',
      data:    Array.from(this.selectedRows),
      columns: this.exportMeta,
    }).subscribe(result => {
      if (result) {
        this.selectedRows.clear();
        this.selectedCount = 0;
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'branch.xlsx');
  }

  // ===== Template helper =====
  protected trackByField(_: number, field: any): any { return field.name ?? _; }
}
