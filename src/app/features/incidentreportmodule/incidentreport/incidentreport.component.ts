import {Component, OnDestroy, OnInit} from '@angular/core';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  INCIDENT_DATA_EXPORT_META,
  INCIDENT_FILTER_FORM_META,
  INCIDENT_MAIN_FORM_META,
  INCIDENT_TABLE_META
} from '../incident.meta';
import {async, Observable, Subject, take, takeUntil} from 'rxjs';
import {Incident} from '../entity/incident';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {IncidentFacadeService} from '../incidentfacade.service';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatChip} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';
import {MatProgressBar} from '@angular/material/progress-bar';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-incidentreport',
  imports: [
    AsyncPipe,
    ButtonPanelComponent,
    DataTableComponent,
    DynamicFieldComponent,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatDivider,
    MatIcon,
    MatProgressBar,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './incidentreport.component.html',
  styleUrl: './incidentreport.component.scss',
  standalone:true
})
export class IncidentReportComponent implements OnInit, OnDestroy   {

  // ===== Meta Data =====
  protected readonly tableColumns = INCIDENT_TABLE_META;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly filterFormMeta = INCIDENT_FILTER_FORM_META;
  protected readonly mainFormMeta = INCIDENT_MAIN_FORM_META;
  protected readonly exportMeta = INCIDENT_DATA_EXPORT_META;

  // ===== Reactive State =====
  protected incidents$: Observable<Incident[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  protected readonly async = async;

  // ===== UI State =====
  protected activeIncident: Incident | null = null;
  protected selectedRows = new Set<Incident>();

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  constructor(
    private incidentFacade: IncidentFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.incidents$ = this.incidentFacade.incident$;
    this.metadata$ = this.incidentFacade.metadata$;
    this.loading$ = this.incidentFacade.loading$;
    this.error$ = this.incidentFacade.error$;
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
    this.incidentFacade.initializeIncidentModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize module.', err)
      });
  }

  // ===== Form creation =====
  private createFilterForm(metadata: any): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      ssincidenttype: metadata.incidentTypes,
      sstripexecution: metadata.tripExecutions,
    });
    this.onFilterFormChanged();
  }

  private createMainForm(metadata: any): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      branch: metadata.branches,
      tripexecution: metadata.tripExecutions,
      incidenttype: metadata.incidentTypes,
      incidentstatus: metadata.incidentStatuses,
      regionalarea: metadata.regionalOffices,
    });
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => this.incidentFacade.filterIncident(filters));
  }

  // ===== Row & Selection Handlers =====
  protected onRowClick(row: Incident): void {
    this.activeIncident = row;
  }

  protected onRowAction(action: string, row: Incident) {
    if (action === 'in-progress') this.inProgress(row);
    if (action === 'vehicle-recovery') this.vehicleRecovery(row);
    if (action === 'pending-allocation') this.pendingAllocation(row);
    if (action === 'resolved') this.resolved(row);
    if (action === 'closed') this.closed(row);
  }

  protected reload(): void { this.incidentFacade.reloadIncidents(); }

  protected onCloseDetailView(): void { this.activeIncident = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) {
      this.incidents$.pipe(
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
      heading: this.mainForm.value.id ? 'Edit Incident' : 'Create Incident',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width:'900px'
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = this.incidentFacade.createIncident(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Incident Reported successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to report Incident', message: err.errorMessage }),
      complete: () => {
        this.reload();
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private inProgress(row:Incident): void {
    this.incidentFacade.inProgress(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Incident in In Progress.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncident?.id === row.id) this.activeIncident = null;
      }
    });
  }

  private vehicleRecovery(row:Incident): void {
    this.incidentFacade.vehicleRecovery(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Vehicle in Recovery.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncident?.id === row.id) this.activeIncident = null;
      }
    });
  }

  private pendingAllocation(row:Incident): void {
    this.incidentFacade.pendingAllocation(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Pending Allocation.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncident?.id === row.id) this.activeIncident = null;
      }
    });
  }

  private resolved(row:Incident): void {
    this.incidentFacade.resolved(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Incident Resolved.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncident?.id === row.id) this.activeIncident = null;
      }
    });
  }

  private closed(row:Incident): void {
    this.incidentFacade.closed(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Incident Closed.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeIncident?.id === row.id) this.activeIncident = null;
      }
    });
  }

  // ===== Export =====
  protected toPdf(): void {
    this.incidents$.pipe(take(1)).subscribe(() => {
      if (this.selectedRows.size > 0) {
        this.dialogService.showPrintDialog({
          width: '1500px',
          height: '650px',
          title: 'Incident Details',
          mode: 'table',
          data: Array.from(this.selectedRows),
          columns: this.exportMeta
        }).subscribe(result => { if (result) this.selectedRows.clear(); });
      } else {
        this.dialogService.showWarning('Please select at least one record to print.');
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'incident.xlsx');
  }

  // ===== Action Panel =====
  protected actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.formBuilderService.resetForm(this.filterForm),
    'create': () => this.openMainForm(),
    'export-pdf': () => this.toPdf(),
    'export-excel': () => this.toExcel()
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
