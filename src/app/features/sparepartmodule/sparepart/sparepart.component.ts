import { Component, OnDestroy, OnInit } from '@angular/core';
import { PART_DATA_EXPORT_META, PART_FILTER_FORM_META, PART_IMMUTABLE_CONTROLLERS_META, PART_MAIN_FORM_META, PART_TABLE_META } from '../model/part.meta';
import { buildActionPanel } from '../../../shared/component/button/action-panel.factory';
import {async, debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import { Part } from '../entity/part';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import { PartFacadeService } from '../service/util/partfacade.service';
import { DialogService } from '../../../core/dialog.service';
import { FormbuilderService } from '../../../core/formbuilder.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import { exportToExcel } from '../../../shared/component/export/excel-export.util';
import { ButtonClickEvent, ButtonPanelComponent } from '../../../shared/component/button/button-panel/button-panel.component';
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatCard, MatCardTitle, MatCardContent } from "@angular/material/card";
import { DynamicFieldComponent } from "../../../shared/component/form/dynamic-field.component";
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {PartMetadata} from '../model/sparepart.metadata.model';
import {PartFormService} from '../service/util/sparepartform.service';
import {PartMetadataService} from '../service/util/sparepart.metadata.service';

@Component({
  selector: 'app-sparepart',
  imports: [
    MatProgressBar,
    MatCard,
    MatCardTitle,
    MatCardContent,
    ButtonPanelComponent,
    DynamicFieldComponent,
    ReactiveFormsModule,
    NgIf,
    MatButton,
    AsyncPipe,
    NgForOf,
    DataTableComponent,
    MatDivider,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    NgClass,
  ],
  templateUrl: './sparepart.component.html',
  styleUrl: './sparepart.component.scss',
  standalone: true,
  providers: [
    PartFacadeService,
    PartFormService,
    PartMetadataService,
  ],
})
export class SparePartComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns         = PART_TABLE_META;
  protected readonly filterFormMeta       = PART_FILTER_FORM_META;
  protected readonly mainFormMeta         = PART_MAIN_FORM_META;
  protected readonly immutableControllers = PART_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta           = PART_DATA_EXPORT_META;
  protected readonly actionPanelConfig    = buildActionPanel();

  // ===== Streams =====
  protected readonly parts$:    Observable<Part[]>;
  protected readonly metadata$: Observable<PartMetadata>;
  protected readonly loading$:  Observable<boolean>;
  protected readonly error$:    Observable<any>;

  // ===== UI state =====
  protected activeRow:    Part | null = null;
  protected selectedRows  = new Set<Part>();
  protected selectedCount = 0;
  protected readonly async = async;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$         = new Subject<void>();
  private currentMetadata: PartMetadata | null = null;

  constructor(
    private facade:      PartFacadeService,
    private formService: PartFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.parts$    = this.facade.parts$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize part module.', err),
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

  protected onRowClick(row: Part): void  { this.activeRow = row; }
  protected onCloseDetailView(): void    { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.parts$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions =====

  protected onRowAction(action: string, row: Part): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
    };
    if (actions[action]) actions[action]();
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  // ===== Action panel =====

  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create':          () => this.openCreateForm(),
      'bulk-deactivate': () => this.deactivateSelected(),
      'clear-search':    () => this.formBuilder.resetForm(this.filterForm),
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

  // ===== Create =====

  private openCreateForm(): void {
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);

    this.dialog.showFormPopup({
      heading: 'Create Part',
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
      next:     () => this.dialog.showSuccess('Part created successfully.'),
      error: (err) => {
        const validationMessage = err.friendlyMessage
          || err.error?.details?.join('\n')
          || err.message;
        this.dialog.showMessage({
          heading: 'Failed to create',
          message: validationMessage
        });
      },      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      },
    });
  }

  // ===== Edit =====

  private openEditForm(row: Part): void {
    if (!this.currentMetadata) return;

    this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, true);

    this.dialog.showFormPopup({
      heading: 'Edit Part',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else {
        this.mainForm = this.formService.buildMainForm(this.currentMetadata!);
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Part updated successfully.'),
      error: (err) => {
        const validationMessage = err.friendlyMessage
          || err.error?.details?.join('\n')
          || err.message;
        this.dialog.showMessage({
          heading: 'Failed to create',
          message: validationMessage
        });
      },      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      },
    });
  }

  // ===== Bulk deactivate =====

  private deactivateSelected(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to deactivate.');
      return;
    }

    this.dialog.showConfirmation({
      heading: 'Deactivate Parts',
      message: 'Selected parts will be deactivated. Are you sure?',
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.facade.deactivate(Array.from(this.selectedRows))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialog.showSuccess('Selected parts deactivated successfully.'),
          error: (err) => {
            const validationMessage = err.friendlyMessage
              || err.error?.details?.join('\n')
              || err.message;
            this.dialog.showMessage({
              heading: 'Failed to create',
              message: validationMessage
            });
          },
          complete: () => {
            this.selectedRows.clear();
            this.selectedCount = 0;
            this.facade.reload();
          },
        });
    });
  }

  // ===== Export =====

  protected toPdf(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to print.');
      return;
    }
    this.dialog.showPrintDialog({
      width: '1500px', height: '650px',
      title: 'Part Details', mode: 'table',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'spare-parts.xlsx');
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }
}
