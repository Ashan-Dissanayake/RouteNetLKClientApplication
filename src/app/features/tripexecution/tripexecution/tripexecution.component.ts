import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {
  TRIP_EXECUTION_MAIN_FORM_META,
  TRIP_EXECUTION_TABLE_META,
} from '../model/tripexecution.meta';
import {async, finalize, Observable, Subject, takeUntil} from 'rxjs';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {TripExecutionFacadeService} from '../service/util/tripexecutionfacade.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {AsyncPipe, formatDate, LowerCasePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {TripExecution} from '../entity/tripexecution';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatChip} from '@angular/material/chips';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TripExecutionFormService} from '../service/util/tripexecutionform.service';
import {TripExecutionMetadataService} from '../service/util/tripexecution.metadata.service';
import {TripExecutionMetadata} from '../model/tripexecution.metadata.model';

@Component({
  selector: 'app-tripexecution',
  imports: [
    MatProgressBar,
    MatCard,
    MatCardHeader,
    MatButton,
    MatCardContent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    AsyncPipe,
    DataTableComponent,
    MatIcon,
    NgIf,
    TableCellDirective,
    MatTooltip,
    NgClass,
    MatMenuItem,
    MatMenu,
    MatMenuTrigger,
    MatChip,
    LowerCasePipe,
    MatProgressSpinner,
  ],
  templateUrl: './tripexecution.component.html',
  styleUrl: './tripexecution.component.scss',
  standalone:true,
  providers:[
    TripExecutionFacadeService,
    TripExecutionMetadataService,
    TripExecutionFormService,
  ]
})
export class TripExecutionComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly mainFormMeta = TRIP_EXECUTION_MAIN_FORM_META;
  protected readonly tableColumns = TRIP_EXECUTION_TABLE_META;

  // ===== Streams =====
  protected readonly tripExecutions$: Observable<TripExecution[]>;
  protected readonly metadata$:       Observable<TripExecutionMetadata>;
  protected readonly loading$:        Observable<boolean>;
  protected readonly error$:          Observable<any>;

  // ===== UI state =====
  protected activeRow: any | null = null;
  protected isAssigning = false;

  // ===== Form =====
  // Inline form — uses handleSave() not showFormPopup()
  protected mainForm: FormGroup = new FormGroup({});

  private destroy$ = new Subject<void>();

  constructor(
    private facade:      TripExecutionFacadeService,
    private formService: TripExecutionFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.tripExecutions$ = this.facade.tripExecutions$;
    this.metadata$        = this.facade.metadata$;
    this.loading$         = this.facade.loading$;
    this.error$           = this.facade.error$;
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
      this.mainForm = this.formService.buildMainForm(meta);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row interaction =====

  protected onRowClick(row: TripExecution): void { this.activeRow = row; }

  protected onRowAction(action: string, row: TripExecution): void {
    // Only assign when vehicle is not yet assigned
    if (action === 'assigned' && (row as any).vehicle == null) {
      this.assignResource(row);
    }
  }

  // ===== Inline form — initialize trip execution =====
  //
  // handleSave() handles validation and the confirmation dialog.
  // Date formatting happens here before handing off to the facade
  // because formatting is a UI/presentation concern — the facade
  // should receive a clean payload, not raw form values.

  protected initializeTripExecution(): void {
    this.formBuilder.handleSave(this.mainForm, 'Trip Execution', payload => {
      payload.doservice = formatDate(payload.doservice, 'yyyy-MM-dd', 'en-US');

      this.facade.initializeTripExecution(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialog.showSuccess('Trip execution initialized successfully.');
            this.formBuilder.resetForm(this.mainForm);
            this.facade.reload();
          },
          error: err => this.dialog.showWarning(err.errorMessage),
        });
    });
  }

  protected cancel(): void {
    this.formBuilder.resetForm(this.mainForm);
  }

  // ===== Resource assignment =====
  //
  // Uses isAssigning instead of the global loading flag —
  // same pattern as roster — so only the assign button reflects
  // the loading state, not the entire page.

  private assignResource(row: TripExecution): void {
    this.isAssigning = true;

    this.facade.assignResource(row).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isAssigning = false),
    ).subscribe({
      next: () => this.dialog.showSuccess('Resource assigned successfully.'),
      error: err => this.dialog.showMessage({
        heading: 'Failed to assign resource',
        message: err.errorMessage,
      }),
      complete: () => {
        this.facade.reload();
        if (this.activeRow?.id === row.id) this.activeRow = null;
      },
    });
  }

  // ===== Status transitions =====
  //
  // changeStatus() maps a status string from the template to the
  // correct facade call via a transitions map.
  // The original had seven private methods (checkedIn, dispatched...)
  // each calling updateTripStatus() — the original already had the
  // right idea with updateTripStatus(). Here it is completed cleanly
  // with a map so adding a new status is one line.

  protected changeStatus(status: string): void {
    if (!this.activeRow) return;

    const id = this.activeRow.id;
    const statusKey = status.toLowerCase();

    const transitions: Record<string, Observable<TripExecution>> = {
      'checked in':  this.facade.checkedIn(id),
      'dispatched':  this.facade.dispatched(id),
      'in progress': this.facade.inProgress(id),
      'arrived':     this.facade.arrived(id),
      'breakdown':   this.facade.breakdown(id),
      'completed':   this.facade.completed(id),
      'cancelled':   this.facade.cancelled(id),
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

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }
}
