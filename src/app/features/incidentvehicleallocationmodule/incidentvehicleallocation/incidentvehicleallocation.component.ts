import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META, INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META,
  INCIDENT_VEHICLE_ALLOCATION_TABLE_META
} from '../model/incidentvehicleallocation.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {async, debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {IncidentVehicleAllocation} from '../entity/incidentvehicleallocation';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {IncidentVehicleAllocationFacadeService} from '../service/util/incidentvehicleallocationfacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {IncidentVehicleAllocationMetadata} from '../model/incidentvehicleallocation.metadata.model';
import {IncidentVehicleAllocationFormService} from '../service/util/incidentvehicleallocationform.service';
import {IncidentVehicleAllocationMetadataService} from '../service/util/incidentvehicleallocation.metadata.service';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-incidentvehicleallocation',
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
    MatIconButton,
    MatMenu,
    MatMenuItem,
    TableCellDirective,
    MatMenuTrigger,
    MatIcon,
  ],
  templateUrl: './incidentvehicleallocation.component.html',
  styleUrl: './incidentvehicleallocation.component.scss',
  standalone:true,
  providers: [
    IncidentVehicleAllocationFacadeService,
    IncidentVehicleAllocationFormService,
    IncidentVehicleAllocationMetadataService,
  ],
})
export class IncidentVehicleAllocationComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns      = INCIDENT_VEHICLE_ALLOCATION_TABLE_META;
  protected readonly filterFormMeta    = INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META;
  protected readonly mainFormMeta      = INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META;
  protected readonly actionPanelConfig = buildActionPanel({ exclude: ['export'] });

  // ===== Streams =====
  protected readonly incidentVehicleAllocations$: Observable<IncidentVehicleAllocation[]>;
  protected readonly metadata$: Observable<IncidentVehicleAllocationMetadata>;
  protected readonly loading$:  Observable<boolean>;
  protected readonly error$:    Observable<any>;

  // ===== UI state =====
  protected activeRow:    IncidentVehicleAllocation | null = null;
  protected selectedRows  = new Set<IncidentVehicleAllocation>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$         = new Subject<void>();
  private currentMetadata: IncidentVehicleAllocationMetadata | null = null;

  constructor(
    private facade:      IncidentVehicleAllocationFacadeService,
    private formService: IncidentVehicleAllocationFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.incidentVehicleAllocations$ = this.facade.incidentVehicleAllocations$;
    this.metadata$ = this.facade.metadata$;
    this.loading$ = this.facade.loading$;
    this.error$ = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize module.', err),
      });

    // Skip EMPTY_INCIDENT_VEHICLE_ALLOCATION_METADATA initial emission
    this.facade.metadata$.pipe(
      filter(meta => meta.incidents.length > 0),
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

  protected onRowClick(row: IncidentVehicleAllocation): void  { this.activeRow = row; }
  protected onCloseDetailView(): void                         { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.incidentVehicleAllocations$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions — status transitions =====
  //
  // Three transitions collapsed into executeTransition() via a map.
  // Adding a new status is one line in the transitions map.

  protected onRowAction(action: string, row: IncidentVehicleAllocation): void {
    const transitions: Record<string, [Observable<any>, string]> = {
      'in-progress':        [this.facade.inProgress(row),        'Allocation set to in progress.'],
      'pending-allocation': [this.facade.pendingAllocation(row), 'Allocation set to pending.'],
      'released':           [this.facade.released(row),          'Allocation released.'],
    };

    const match = transitions[action];
    if (match) this.executeTransition(match[0], match[1], row);
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  private executeTransition(
    operation$: Observable<any>,
    successMessage: string,
    row: IncidentVehicleAllocation,
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
      heading: 'Create Incident Allocation',
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
      next:     () => this.dialog.showSuccess('Incident Vehicle Allocation created successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to create', message: err.errorMessage }),
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
    this.dialog.showWarning(`Unhandled dropdown: ${event.type}`);
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }
}
