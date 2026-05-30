import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META, INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META,
  INCIDENT_VEHICLE_ALLOCATION_TABLE_META
} from '../incidentvehicleallocation.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {async, Observable, Subject, take, takeUntil} from 'rxjs';
import {IncidentVehicleAllocation} from '../entity/incidentvehicleallocation';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {IncidentVehicleAllocationFacadeService} from '../incidentvehicleallocationfacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';

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
  standalone:true
})
export class IncidentVehicleAllocationComponent implements OnInit, OnDestroy{

  // ===== Meta Data =====
  protected readonly tableColumns = INCIDENT_VEHICLE_ALLOCATION_TABLE_META;
  protected readonly actionPanelConfig = buildActionPanel({exclude:['export']});
  protected readonly filterFormMeta = INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META;
  protected readonly mainFormMeta = INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META;

  // ===== Reactive State =====
  protected incidentVehicleAllocations$: Observable<IncidentVehicleAllocation[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  // ===== UI State =====
  protected activeIncidentVehicleAllocation: IncidentVehicleAllocation | null = null;
  protected selectedRows = new Set<IncidentVehicleAllocation>();

  protected readonly async = async;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  constructor(
    private incidentVehicleAllocationFacade: IncidentVehicleAllocationFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.incidentVehicleAllocations$ = this.incidentVehicleAllocationFacade.incidentVehicleAllocations$;
    this.metadata$ = this.incidentVehicleAllocationFacade.metadata$;
    this.loading$ = this.incidentVehicleAllocationFacade.loading$;
    this.error$ = this.incidentVehicleAllocationFacade.error$;
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
    this.incidentVehicleAllocationFacade.initializeIncidentVehicleAllocationModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize module.', err)
      });
  }

  // ===== Form creation =====
  private createFilterForm(metadata: any): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      ssincident: metadata.incidents,
      ssvehicle: metadata.vehicles,
    });
    this.onFilterFormChanged();
  }

  private createMainForm(metadata: any): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      incident: metadata.incidents,
      vehicle: [],
      providedbranch: [],
      incidentvehicleallocationstatus: metadata.incidentVehicleAllocationStatuses,
    });

    this.onIncidentChanged();
    this.onBranchChanged();
  }

  private onIncidentChanged(): void {
    this.mainForm.get('incident')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(incident => {
        const filteredBranches = incident
          ? this.incidentVehicleAllocationFacade.getBranchesForIncident(incident.id)
          : [];
        this.formBuilderService.updateOptions(
          this.mainFormMeta, this.mainForm, 'providedbranch', filteredBranches
        );

        // Reset downstream when incident changes
        this.formBuilderService.updateOptions(
          this.mainFormMeta, this.mainForm, 'vehicle', []
        );
      });
  }

  private onBranchChanged(): void {
    this.mainForm.get('providedbranch')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(branch => {
        const filteredVehicles = branch
          ? this.incidentVehicleAllocationFacade.getVehiclesForBranch(branch.id)
          : [];

        this.formBuilderService.updateOptions(
          this.mainFormMeta, this.mainForm, 'vehicle', filteredVehicles
        );
      });
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => this.incidentVehicleAllocationFacade.filterIncidentVehicleAllocations(filters));
  }

  // ===== Row & Selection Handlers =====
  protected onRowClick(row: IncidentVehicleAllocation): void {
    this.activeIncidentVehicleAllocation = row;
  }

  protected onRowAction(action: string, row: IncidentVehicleAllocation) {
    if (action === 'in-progress') this.inProgress(row);
    if (action === 'pending-allocation') this.pendingAllocation(row);
    if (action === 'released') this.released(row);
  }

  protected reload(): void { this.incidentVehicleAllocationFacade.reloadIncidentVehicleAllocations(); }

  protected onCloseDetailView(): void { this.activeIncidentVehicleAllocation = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) {
      this.incidentVehicleAllocations$.pipe(
        take(1)
      ).subscribe(
        rows => rows.forEach(
          r => this.selectedRows.add(r)
        ));
    }
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Incident Allocation' : 'Create Incident Allocation',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width:'900px'
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = this.incidentVehicleAllocationFacade.createIncidentVehicleAllocation(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Incident Vehicle Allocation Reported successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to report Incident', message: err.errorMessage }),
      complete: () => {
        this.reload();
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private pendingAllocation(row:IncidentVehicleAllocation): void {
    this.incidentVehicleAllocationFacade.pendingAllocation(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Pending Allocation.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncidentVehicleAllocation?.id === row.id) this.activeIncidentVehicleAllocation = null;
      }
    });
  }

  private inProgress(row:IncidentVehicleAllocation): void {
    this.incidentVehicleAllocationFacade.inProgress(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Allocation in In Progress.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncidentVehicleAllocation?.id === row.id) this.activeIncidentVehicleAllocation = null;
      }
    });
  }

  private released(row:IncidentVehicleAllocation): void {
    this.incidentVehicleAllocationFacade.released(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Allocation in Released.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncidentVehicleAllocation?.id === row.id) this.activeIncidentVehicleAllocation = null;
      }
    });
  }

  // ===== Action Panel =====
  protected actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.formBuilderService.resetForm(this.filterForm),
    'create': () => this.openMainForm(),
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
