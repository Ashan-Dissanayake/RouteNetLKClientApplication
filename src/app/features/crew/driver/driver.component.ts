import {Component, OnDestroy, OnInit} from '@angular/core';
import {Driver} from '../entity/driver';
import {async, debounceTime, filter, Observable, Subject, take, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatDivider} from '@angular/material/list';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {DriverFacadeService} from '../service/util/driverfacade.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {
  DRIVER_DATA_EXPORT_META,
  DRIVER_FILTER_FORM_META, DRIVER_IMMUTABLE_CONTROLLERS_META, DRIVER_MAIN_FORM_META,
  DRIVER_TABLE_META
} from '../model/driver.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DriverFormService} from '../service/util/driverformservice';
import {DriverMetadataService} from '../service/util/driver.metadata.service';
import {DriverMetadata} from '../model/driver.metadata.model';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {BRANCH_FILTER_FORM_META} from '../../branchmodule/model/branch.meta';

@Component({
  selector: 'app-crew',
  standalone:true,
  imports: [
    DataTableComponent,
    MatButton,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ButtonPanelComponent,
    AsyncPipe,
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatCardTitle
  ],
  providers: [
    DriverFacadeService,
    DriverFormService,
    DriverMetadataService,
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss'
})
export class DriverComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns         = DRIVER_TABLE_META;
  protected readonly filterFormMeta       = DRIVER_FILTER_FORM_META;
  protected readonly mainFormMeta         = DRIVER_MAIN_FORM_META;
  protected readonly immutableControllers = DRIVER_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta           = DRIVER_DATA_EXPORT_META;
  protected readonly actionPanelConfig    = buildActionPanel({ exclude: ['bulk-deactivate'] });

  // ===== Streams (pass-through from facade) =====
  protected readonly drivers$:  Observable<Driver[]>;
  protected readonly metadata$: Observable<DriverMetadata>;
  protected readonly loading$:  Observable<boolean>;
  protected readonly error$:    Observable<any>;

  // ===== UI state =====
  protected activeRow:    Driver | null = null;
  protected selectedRows  = new Set<Driver>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$ = new Subject<void>();

  // Holds the current metadata so edit form can access it
  // without re-subscribing inside the edit handler
  private currentMetadata: DriverMetadata | null = null;

  constructor(
    private facade:      DriverFacadeService,
    private formService: DriverFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.drivers$  = this.facade.drivers$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize module.', err),
      });

    // Build forms once real metadata arrives — skip EMPTY_DRIVER_METADATA
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

  protected onRowClick(row: Driver): void {
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
      this.drivers$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  // ===== Row actions =====
  protected onRowAction(action: string, row: Driver): void {
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

  protected reload(): void {
    this.facade.reload();
  }

  // ===== Create =====
  private openCreateForm(): void {
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);

    this.dialog.showFormPopup({
      heading: 'Create Driver',
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
      next:     () => this.dialog.showSuccess('Driver created successfully.'),
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
        // Rebuild create form so dynamic regex wiring starts fresh
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      },
    });
  }

  // ===== Edit =====
  //
  // FormService.buildMainFormForEdit() handles:
  //   - Deriving the employee list from current drivers snapshot
  //   - Patching the form with DriverMapper.toForm(row)
  //   - Wiring the license category → dynamic regex subscription
  // The component just opens the dialog with the returned form.

  private openEditForm(row: Driver): void {
    if (!this.currentMetadata) return;

    // Form service builds a fresh form scoped to edit mode
    this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);

    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, true);

    this.dialog.showFormPopup({
      heading: 'Edit Driver',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else {
        // Restore create form on cancel so next create starts clean
        this.mainForm = this.formService.buildMainForm(this.currentMetadata!);
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Driver updated successfully.'),
      error: (err) => {
        const validationMessage = err.friendlyMessage
          || err.error?.details?.join('\n')
          || err.message;
        this.dialog.showMessage({
          heading: 'Failed to Update',
          message: validationMessage
        });
      },      complete: () => {
        this.facade.reload();
        // Restore create form after edit completes
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
      width:   '1500px',
      height:  '650px',
      title:   'Driver Details',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'drivers.xlsx');
  }

  // ===== Template helper =====
  protected trackByField(_: number, field: any): any {
    return field.key ?? _;
  }

  protected readonly async = async;
  protected readonly BRANCH_FILTER_FORM_META = BRANCH_FILTER_FORM_META;
}
