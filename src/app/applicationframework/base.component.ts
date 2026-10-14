import { Directive, OnInit, OnDestroy, inject} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import { CheckboxEvent } from '../shared/component/data-table/data-table.component';
import { ButtonClickEvent } from '../shared/component/button/button-panel/button-panel.component';
import { exportToExcel } from '../shared/component/export/excel-export.util';
import { DialogService } from '../shared/services/dialog.service';
import { FormbuilderService } from '../shared/services/formbuilder.service';
import {CrudFacade} from './crud.facade';
import {CrudFormService} from './crudform.service';
import {CrudPageConfig} from './crudpage.config';
import {FormField} from '../shared/models/formfieldata.model';

@Directive()
export abstract class BaseComponent<TEntity extends { id?: number }, TMetadata> implements OnInit, OnDestroy {
  // Common dependencies resolved via inject()
  protected dialog = inject(DialogService);
  protected formBuilder = inject(FormbuilderService);
  protected destroy$ = new Subject<void>();

  protected abstract readonly config: CrudPageConfig;

  protected abstract facade: CrudFacade<TEntity, TMetadata>;

  protected abstract formService: CrudFormService<TEntity, TMetadata>;

  // Common UI State
  protected activeRow: TEntity | null = null;
  protected selectedRows = new Set<TEntity>();
  protected selectedCount = 0;
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});
  protected currentMetadata: TMetadata | null = null;

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showErrorMessage(`Failed to initialize ${this.config.moduleName} module.`, err),
      });

    this.facade.metadata$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(meta => {
      this.currentMetadata = meta;
      this.filterForm = this.formService.buildFilterForm(meta);
      this.mainForm = this.formService.buildMainForm(meta);
      this.watchFilterForm();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected watchFilterForm(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
    ).subscribe(values => this.facade.filter(values));
  }

  protected onRowClick(row: TEntity): void {
    this.activeRow = row;
  }

  protected onCloseDetailView(): void {
    this.activeRow = null;
  }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.facade.items$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void {
    this.facade.reload();
  }

  protected onRowAction(action: string, row: TEntity): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
      ...this.getCustomRowActions(row)
    };
    if (actions[action]) {
      actions[action]();
    } else {
      this.dialog.showWarning(`Unknown row action: ${action}`);
    }
  }

  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create':          () => this.openCreateForm(),
      'bulk-deactivate': () => this.deactivateSelected(),
      'clear-search':    () => this.formBuilder.resetForm(this.filterForm),
      ...this.getCustomActionPanelHandlers()
    };
    if (handlers[event.type]) {
      handlers[event.type]();
    } else {
      this.dialog.showWarning(`No handler for: ${event.type}`);
    }
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'export-pdf':   () => this.toPdf(),
      'export-excel': () => this.toExcel(),
    };
    if (handlers[event.type]) {
      handlers[event.type]();
    } else {
      this.dialog.showWarning(`Unhandled dropdown: ${event.type}`);
    }
  }

  // --- Create ---
  protected openCreateForm(): void {
    if (!this.facade.create) {
      this.dialog.showWarning('Creating records is not supported in this module.');
      return;
    }
    this.formBuilder.setControlsState(this.mainForm, this.config.immutableControllers ?? [], false);

    this.dialog.showFormPopup({
      heading: `Create ${this.config.moduleName}`,
      form:    this.mainForm,
      meta:    this.config.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.resetMainForm();
    });
  }

  protected save(formData: any): void {
    if (!this.facade.create) return;
    this.facade.create(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess(`${this.config.moduleName} created successfully.`),
      error: err => this.dialog.showErrorMessage(`Failed to create ${this.config.moduleName}`, err),
      complete: () => {
        this.facade.reload();
        this.resetMainForm();
      },
    });
  }

  // --- Edit ---
  protected openEditForm(row: TEntity): void {
    if (!this.facade.update) {
      this.dialog.showWarning('Editing records is not supported in this module.');
      return;
    }
    if (!this.currentMetadata) return;

    if (this.formService.buildMainFormForEdit) {
      this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);
    } else {
      this.mainForm = this.formService.buildMainForm(this.currentMetadata);
      this.mainForm.patchValue(row);
    }

    this.formBuilder.setControlsState(this.mainForm, this.config.immutableControllers ?? [], true);

    this.dialog.showFormPopup({
      heading: `Edit ${this.config.moduleName}`,
      form:    this.mainForm,
      meta:    this.config.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else this.resetMainForm();
    });
  }

  protected update(formData: any): void {
    if (!this.facade.update) return;
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess(`${this.config.moduleName} updated successfully.`),
      error: err => this.dialog.showErrorMessage(`Failed to update ${this.config.moduleName}`, err),
      complete: () => {
        this.facade.reload();
        this.resetMainForm();
      },
    });
  }

  // --- Bulk Deactivate ---
  protected deactivateSelected(): void {
    if (!this.facade.deactivate) {
      this.dialog.showWarning('Deactivation is not supported in this module.');
      return;
    }
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning(`Please select at least one record to deactivate.`);
      return;
    }

    this.dialog.showConfirmation({
      heading: `Deactivate ${this.config.moduleName}s`,
      message: this.getDeactivateConfirmationMessage(),
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.facade.deactivate!(Array.from(this.selectedRows))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialog.showSuccess(`Selected ${this.config.moduleName}s deactivated successfully.`),
          error: err => this.dialog.showErrorMessage('Deactivation failed', err),
          complete: () => {
            this.selectedRows.clear();
            this.selectedCount = 0;
            this.facade.reload();
          },
        });
    });
  }

  // --- Export ---
  protected toPdf(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to print.');
      return;
    }

    this.dialog.showPrintDialog({
      width:   '1500px',
      height:  '650px',
      title:   `${this.config.moduleName} Details`,
      mode:    'table',
      data:    Array.from(this.selectedRows),
      columns: this.config.exportMeta,
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
    exportToExcel(Array.from(this.selectedRows), this.config.exportMeta, this.config.excelFileName);
  }

  protected trackByField(_: number, field: FormField): string {
    return field.name;
  }

  protected resetMainForm(): void {
    if (this.currentMetadata) {
      this.mainForm = this.formService.buildMainForm(this.currentMetadata);
    } else {
      this.formBuilder.resetForm(this.mainForm);
    }
    this.formBuilder.setControlsState(
      this.mainForm,
      this.config.immutableControllers ?? [],
      true
    );
  }


  protected get items$(): Observable<TEntity[]> {
    return this.facade.items$;
  }

  protected get metadata$(): Observable<TMetadata> {
    return this.facade.metadata$;
  }

  protected get loading$(): Observable<boolean> {
    return this.facade.loading$;
  }

  protected get error$(): Observable<unknown> {
    return this.facade.error$;
  }

  // Subclass Extension Hooks
  protected getCustomRowActions(row: TEntity): Record<string, () => void> {
    return {};
  }

  protected getCustomActionPanelHandlers(): Record<string, () => void> {
    return {};
  }

  protected getDeactivateConfirmationMessage(): string {
    return `Are you sure you want to deactivate the selected ${this.config.moduleName}s?`;
  }
}
