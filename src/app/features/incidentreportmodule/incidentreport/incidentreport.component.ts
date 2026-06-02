import {Component, OnDestroy, OnInit} from '@angular/core';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  INCIDENT_DATA_EXPORT_META,
  INCIDENT_FILTER_FORM_META,
  INCIDENT_MAIN_FORM_META,
  INCIDENT_TABLE_META
} from '../model/incident.meta';
import {async, debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {Incident} from '../entity/incident';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {IncidentFacadeService} from '../service/util/incidentfacade.service';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatProgressBar} from '@angular/material/progress-bar';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {IncidentMetadata} from '../model/incidentreport.metadata.model';
import {IncidentFormService} from '../service/util/incidentform.service';
import {IncidentMetadataService} from '../service/util/incident.metadata.service';

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
  standalone:true,
  providers: [
    IncidentFacadeService,
    IncidentFormService,
    IncidentMetadataService,
  ],
})
export class IncidentReportComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns    = INCIDENT_TABLE_META;
  protected readonly filterFormMeta  = INCIDENT_FILTER_FORM_META;
  protected readonly mainFormMeta    = INCIDENT_MAIN_FORM_META;
  protected readonly exportMeta      = INCIDENT_DATA_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel();

  // ===== Streams =====
  protected readonly incidents$: Observable<Incident[]>;
  protected readonly metadata$:  Observable<IncidentMetadata>;
  protected readonly loading$:   Observable<boolean>;
  protected readonly error$:     Observable<any>;

  // ===== UI state =====
  protected activeRow:    Incident | null = null;
  protected selectedRows  = new Set<Incident>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$         = new Subject<void>();
  private currentMetadata: IncidentMetadata | null = null;

  constructor(
    private facade:      IncidentFacadeService,
    private formService: IncidentFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.incidents$ = this.facade.incidents$;
    this.metadata$   = this.facade.metadata$;
    this.loading$    = this.facade.loading$;
    this.error$      = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize module.', err),
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

  protected onRowClick(row: Incident): void  { this.activeRow = row; }
  protected onCloseDetailView(): void        { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.incidents$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions — status transitions =====
  //
  // Five transitions collapsed into executeTransition() via a map.
  // Adding a new status is one line in the transitions map.

  protected onRowAction(action: string, row: Incident): void {
    const transitions: Record<string, [Observable<any>, string]> = {
      'in-progress':        [this.facade.inProgress(row),        'Incident set to in progress.'],
      'vehicle-recovery':   [this.facade.vehicleRecovery(row),   'Vehicle recovery initiated.'],
      'pending-allocation': [this.facade.pendingAllocation(row), 'Incident pending allocation.'],
      'resolved':           [this.facade.resolved(row),          'Incident resolved.'],
      'closed':             [this.facade.closed(row),            'Incident closed.'],
    };

    const match = transitions[action];
    if (match) this.executeTransition(match[0], match[1], row);
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  private executeTransition(
    operation$: Observable<any>,
    successMessage: string,
    row: Incident,
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
      heading: 'Create Incident',
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
      next:     () => this.dialog.showSuccess('Incident reported successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to report incident', message: err.errorMessage }),
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
      title: 'Incident Details', mode: 'table',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'incidents.xlsx');
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }
}
