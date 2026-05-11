import {Component, OnDestroy, OnInit} from '@angular/core';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {TRIP_DATA_EXPORT_META, TRIP_FILTER_FORM_META, TRIP_MAIN_FORM_META, TRIP_TABLE_META} from '../trip.meta';
import {async, Observable, Subject, take, takeUntil} from 'rxjs';
import {Trip} from '../entity/trip';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {TripFacadeService} from '../tripfacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
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
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {MatHint} from '@angular/material/select';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-trip',
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
    NgForOf,
    ReactiveFormsModule,
    DataTableComponent,
    MatDivider,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass,
    MatMenu,
    MatIconButton,
    MatMenuTrigger,
    MatMenuItem
  ],
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.scss',
  standalone: true
})
export class TripComponent  implements OnInit, OnDestroy {

  // ===== Meta Data =====
  protected readonly tableColumns = TRIP_TABLE_META;
  protected readonly actionPanelConfig = buildActionPanel({exclude:['bulk-deactivate']});
  protected readonly filterFormMeta = TRIP_FILTER_FORM_META;
  protected readonly mainFormMeta = TRIP_MAIN_FORM_META;
  protected readonly exportMeta = TRIP_DATA_EXPORT_META;

  protected readonly async = async;

  // ===== Reactive State =====
  protected trips$: Observable<Trip[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  // ===== UI State =====
  protected activeTrip: Trip | null = null;
  protected selectedRows = new Set<Trip>();

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  constructor(
    private tripFacade: TripFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.trips$ = this.tripFacade.trip$;
    this.metadata$ = this.tripFacade.metadata$;
    this.loading$ = this.tripFacade.loading$;
    this.error$ = this.tripFacade.error$;
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
    this.tripFacade.initializeTripModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize trip module.', err)
      });
  }

  // ===== Form creation =====
  private createFilterForm(metadata: any): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      sstriptype: metadata.tripTypes,
      sstripstatus: metadata.tripStatuses,
    });
    this.onFilterFormChanged();
  }

  private createMainForm(metadata: any): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      branch: metadata.branches,
      triptype: metadata.tripTypes,
      tripstatus: metadata.tripStatuses,
      opcalender: metadata.opCalenders,
      permite: metadata.permits,
      originterminal: metadata.originTerminals,
    });
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => this.tripFacade.filterTrips(filters));
  }

  // ===== Row & Selection Handlers =====
  protected onRowClick(row: Trip): void {
    this.activeTrip = row;
  }

  protected reload(): void { this.tripFacade.reloadTrips(); }

  protected onCloseDetailView(): void {
    this.activeTrip = null;
  }

  protected onRowAction(action: string, row: Trip) {
    if (action === 'activate') this.activate(row);
    if (action === 'suspend') this.suspend(row);
    if (action === 'discontinue') this.discontinue(row);
  }

  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) {
      this.trips$.pipe(take(1)).subscribe(
        rows => rows.forEach(
          r => this.selectedRows.add(r)
        )
      );
    }
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Trip' : 'Create Trip',
      form: this.mainForm,
      meta: this.mainFormMeta
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = formData.id
      ? this.tripFacade.updateTrip(formData)
      : this.tripFacade.createTrip(formData);

    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Trip Saved successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to save trip', message: err.errorMessage }),
      complete: () => {
        this.tripFacade.reloadTrips();
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private activate(row:Trip): void {
    this.tripFacade.activateTrip(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Trip in Execution.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to execute trip', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeTrip?.id === row.id) this.activeTrip = null;
      }
    });
  }

  private suspend(row:Trip): void {
    this.tripFacade.suspendTrip(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Trip Completed.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to complete trip', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeTrip?.id === row.id) this.activeTrip = null;
      }
    });
  }

  private discontinue(row:Trip): void {
    this.tripFacade.discontinueTrip(row).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Trip Cancelled.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to cancel trip', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeTrip?.id === row.id) this.activeTrip = null;
      }
    });
  }

  // ===== Export =====
  protected toPdf(): void {
    this.trips$.pipe(take(1)).subscribe(selectedArray => {
      if (this.selectedRows.size > 0) {
        this.dialogService.showPrintDialog({
          width: '1500px',
          height: '650px',
          title: 'Trip Details',
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
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'trips.xlsx');
  }

  // ===== Action Panel =====
  protected actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.filterForm.reset(),
    'create': () => this.openMainForm(),
    // 'bulk-deactivate': () => this.deactivateSelectedRows(),
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

  // ===== TrackBy for optimization ====
  trackByField(index: number, field: any) {
    return field.key || index;
  }

}
