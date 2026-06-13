import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  CONDUCTOR_DATA_EXPORT_META,
  CONDUCTOR_FILTER_FORM_META,
  CONDUCTOR_IMMUTABLE_CONTROLLERS_META, CONDUCTOR_MAIN_FORM_META,
  CONDUCTOR_TABLE_META
} from '../model/conductor.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Conductor} from '../entity/conductor';
import {async, debounceTime, filter, Observable, Subject, take, takeUntil} from 'rxjs';
import {ConductorFacadeService} from '../service/util/conductorfacade.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {ConductorMetadata} from '../model/conductor.metadata.model';
import {ConductorFormService} from '../service/util/conductorformservice';
import {ConductorMetadataService} from '../service/util/conductor.metadata.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-conductor',
  standalone:true,
  imports: [
    ButtonPanelComponent,
    DataTableComponent,
    DynamicFieldComponent,
    MatButton,
    MatDivider,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass,
    AsyncPipe,
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatCardTitle
  ],
  providers: [
    ConductorFacadeService,
    ConductorFormService,
    ConductorMetadataService,
  ],
  templateUrl: './conductor.component.html',
  styleUrl: './conductor.component.scss'
})
export class ConductorComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns         = CONDUCTOR_TABLE_META;
  protected readonly filterFormMeta       = CONDUCTOR_FILTER_FORM_META;
  protected readonly mainFormMeta         = CONDUCTOR_MAIN_FORM_META;
  protected readonly immutableControllers = CONDUCTOR_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta           = CONDUCTOR_DATA_EXPORT_META;
  protected readonly actionPanelConfig    = buildActionPanel({ exclude: ['bulk-deactivate'] });

  // ===== Streams =====
  protected readonly conductors$: Observable<Conductor[]>;
  protected readonly metadata$:   Observable<ConductorMetadata>;
  protected readonly loading$:    Observable<boolean>;
  protected readonly error$:      Observable<any>;

  // ===== UI state =====
  protected activeRow:    Conductor | null = null;
  protected selectedRows  = new Set<Conductor>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$        = new Subject<void>();
  private currentMetadata: ConductorMetadata | null = null;

  constructor(
    private facade:      ConductorFacadeService,
    private formService: ConductorFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.conductors$ = this.facade.conductors$;
    this.metadata$   = this.facade.metadata$;
    this.loading$    = this.facade.loading$;
    this.error$      = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showErrorMessage('Failed to initialize module.', err),
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

  protected onRowClick(row: Conductor): void    { this.activeRow = row; }
  protected onCloseDetailView(): void           { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.conductors$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  // ===== Row actions =====

  protected onRowAction(action: string, row: Conductor): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
    };
    if (actions[action]) actions[action]();
    else this.dialog.showWarning(`Unknown row action: ${action}`);
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

  protected reload(): void { this.facade.reload(); }

  // ===== Create =====

  private openCreateForm(): void {
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);

    this.dialog.showFormPopup({
      heading: 'Create Conductor',
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
      next:     () => this.dialog.showSuccess('Conductor created successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to create', err),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      },
    });
  }

  // ===== Edit =====

  private openEditForm(row: Conductor): void {
    if (!this.currentMetadata) return;

    this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, true);

    this.dialog.showFormPopup({
      heading: 'Edit Conductor',
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
      next:     () => this.dialog.showSuccess('Conductor updated successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to Update', err),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      },
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
      title: 'Conductor Details', mode: 'table',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'conductors.xlsx');
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }

  protected readonly async = async;
}
