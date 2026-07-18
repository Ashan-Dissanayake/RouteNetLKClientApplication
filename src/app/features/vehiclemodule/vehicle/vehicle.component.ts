import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  VEHICLE_DATA_EXPORT_META,
  VEHICLE_FILTER_FORM_META, VEHICLE_IMMUTABLE_CONTROLLERS_META, VEHICLE_MAIN_FORM_META,
  VEHICLE_TABLE_META
} from '../model/vehicle.meta';
import {Vehicle} from '../entity/vehicle';
import {VehicleFacadeService} from '../service/util/vehiclefacade.service';
import {async, debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {VehicleMetadata} from '../model/vehicle.metadata.model';
import {VehicleFormService} from '../service/util/vehicleform.service';
import {VehicleMetadataService} from '../service/util/vehicle.metadata.service';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {BRANCH_FILTER_FORM_META, BRANCH_TABLE_META} from '../../branchmodule/model/branch.meta';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  standalone: true,
  imports: [
    DataTableComponent,
    MatButton,
    MatIcon,
    TableCellDirective,
    SideViewComponent,
    NgClass,
    MatDivider,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
  ],
  styleUrl: './vehicle.component.scss',
  providers: [
    VehicleFacadeService,
    VehicleFormService,
    VehicleMetadataService,
  ],
})
export class VehicleComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns         = VEHICLE_TABLE_META;
  protected readonly filterFormMeta       = VEHICLE_FILTER_FORM_META;
  protected readonly mainFormMeta         = VEHICLE_MAIN_FORM_META;
  protected readonly immutableControllers = VEHICLE_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta           = VEHICLE_DATA_EXPORT_META;
  protected readonly actionPanelConfig    = buildActionPanel();

  // ===== Streams =====
  protected readonly vehicles$: Observable<Vehicle[]>;
  protected readonly metadata$:  Observable<VehicleMetadata>;
  protected readonly loading$:   Observable<boolean>;
  protected readonly error$:     Observable<any>;

  // ===== UI state =====
  protected activeRow:    Vehicle | null = null;
  protected selectedRows  = new Set<Vehicle>();
  protected selectedCount = 0;
  protected readonly async = async;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$         = new Subject<void>();
  private currentMetadata: VehicleMetadata | null = null;

  constructor(
    private facade:      VehicleFacadeService,
    private formService: VehicleFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.vehicles$ = this.facade.vehicles$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showErrorMessage('Failed to initialize module.', err),
      });

    // Build forms once real metadata arrives — skip EMPTY_VEHICLE_METADATA
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

  protected onRowClick(row: Vehicle): void  { this.activeRow = row; }
  protected onCloseDetailView(): void       { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.vehicles$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions =====

  protected onRowAction(action: string, row: Vehicle): void {
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
      heading: 'Create Vehicle',
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
      next:     () => this.dialog.showSuccess('Vehicle created successfully.'),
      error: err => this.dialog.showErrorMessage('Failed to create', err),
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
  //
  // FormService.buildMainFormForEdit() handles the nested value
  // normalization (seatingcapacity.make → make) and form patching.
  // The component has no knowledge of that data shape mismatch.

  private openEditForm(row: Vehicle): void {
    if (!this.currentMetadata) return;

    this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, true);

    this.dialog.showFormPopup({
      heading: 'Edit Vehicle',
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
      next:     () => this.dialog.showSuccess('Vehicle updated successfully.'),
      error: err => this.dialog.showErrorMessage('Failed to update', err),
      complete: () => {
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
      heading: 'Deactivate Vehicles',
      message: 'Only vehicles with status Out of Service or Decommissioned will be deactivated. Are you sure?',
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.facade.deactivate(Array.from(this.selectedRows))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialog.showSuccess('Selected vehicles deactivated successfully.'),
          error: err => this.dialog.showErrorMessage('Failed to deactivate', err),

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
      title: 'Vehicle Details', mode: 'table',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'vehicles.xlsx');
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }

}
