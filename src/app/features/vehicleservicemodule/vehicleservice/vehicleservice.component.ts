import {Component, OnDestroy, OnInit} from '@angular/core';
import {VehicleServiceFacadeService} from '../service/util/vehicleservicefacade.service';
import {VehicleServiceFormService} from '../service/util/vehicleservicefrom.service';
import {VehicleServiceMetadataService} from '../service/util/vehicleservice.metadat.service';
import {
  VEHICLE_SERVICE_DATA_EXPORT_META,
  VEHICLE_SERVICE_FILTER_FORM_META,
  VEHICLE_SERVICE_MAIN_FORM_META,
  VEHICLE_SERVICE_TABLE_META
} from '../model/vehicleservice.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {VehicleService} from '../entity/vehicleservice';
import {VehicleServiceMetadata} from '../model/vehicleservice.metadata.model';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-vehicleservice',
  imports: [
    AsyncPipe,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    DataTableComponent,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    SideViewComponent,
    TableCellDirective,
    MatMenuTrigger,
    NgClass
  ],
  templateUrl: './vehicleservice.component.html',
  styleUrl: './vehicleservice.component.scss',
  standalone:true,
  providers:[
    VehicleServiceFacadeService,
    VehicleServiceFormService,
    VehicleServiceMetadataService
  ]
})
export class VehicleServiceComponent  implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns    = VEHICLE_SERVICE_TABLE_META;
  protected readonly filterFormMeta  = VEHICLE_SERVICE_FILTER_FORM_META;
  protected readonly mainFormMeta    = VEHICLE_SERVICE_MAIN_FORM_META;
  protected readonly exportMeta      = VEHICLE_SERVICE_DATA_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel({ exclude: ['bulk-deactivate'] });

  // ===== Streams =====
  protected readonly vehicleServices$:     Observable<VehicleService[]>;
  protected readonly metadata$: Observable<VehicleServiceMetadata>;
  protected readonly loading$:  Observable<boolean>;
  protected readonly error$:    Observable<any>;

  // ===== UI state =====
  protected activeRow:    VehicleService | null = null;
  protected selectedRows  = new Set<VehicleService>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$        = new Subject<void>();
  private currentMetadata: VehicleServiceMetadata | null = null;

  constructor(
    private facade:      VehicleServiceFacadeService,
    private formService: VehicleServiceFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.vehicleServices$     = this.facade.vehicleServices$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize Vehicle Service module.', err),
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

  // ===== Create =====

  private openCreateForm(): void {
    this.dialog.showFormPopup({
      heading: 'Create Vehicle Service',
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
      next:     () => this.dialog.showSuccess('Vehicle Service created successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to create', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      },
    });
  }

  // ===== Row interaction =====

  protected onRowClick(row: VehicleService): void  { this.activeRow = row; }

  protected onCloseDetailView(): void   { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onRowAction(action: string, row: VehicleService): void {
    this.activeRow = row;          // ensure activeRow is set from the action row
    this.changeStatus(action);
  }
  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.vehicleServices$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Status transitions =====
  protected changeStatus(status: string): void {
    if (!this.activeRow) return;

    const id = this.activeRow.id;
    const statusKey = status.toLowerCase();

    const transitions: Record<string, Observable<VehicleService>> = {
      'execute':  this.facade.startExecution(id),
      'parts-on-hold':  this.facade.placeOnHold(id),
      'completed':   this.facade.complete(id),
    };

    const operation$ = transitions[statusKey];
    if (!operation$) {
      this.dialog.showWarning(`Unknown status: ${status}`);
      return;
    }

    this.executeTransition(operation$);
  }

  private executeTransition(operation$: Observable<any>): void {
    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Status updated successfully.'),
      error:    err => this.dialog.showMessage({
        heading: 'Failed to update status',
        message: err.errorMessage,
      }),
      complete: () => {
        this.facade.reload();
        this.activeRow = null;
      },
    });
  }


  // ===== Action panel =====

  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'clear-search': () => this.formBuilder.resetForm(this.filterForm),
      'create':       () => this.openCreateForm(),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`No handler for: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'export-pdf':   () => this.toPdf(),
      'export-excel': () => this.toExcel()
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
      title: 'Vehicle Service Details', mode: 'table',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'vehicle-service.xlsx');
  }


  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }



}
