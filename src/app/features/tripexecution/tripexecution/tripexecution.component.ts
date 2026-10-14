import {Component, inject} from '@angular/core';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {TRIP_EXECUTION_MAIN_FORM_META, TRIP_EXECUTION_TABLE_META,} from '../model/tripexecution.meta';
import {finalize, Observable, takeUntil} from 'rxjs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';
import {FormSubmissionService} from '../../../shared/services/formsubmission.service';

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
  standalone: true,
  providers: [
    TripExecutionFacadeService,
    TripExecutionMetadataService,
    TripExecutionFormService,
  ],
})
export class TripExecutionComponent extends BaseComponent<TripExecution, TripExecutionMetadata> {

  protected override readonly config: CrudPageConfig = {
    tableColumns: TRIP_EXECUTION_TABLE_META,
    filterFormMeta: [],
    mainFormMeta: TRIP_EXECUTION_MAIN_FORM_META,
    exportMeta: [],
    actionPanel: [],
    moduleName: 'Trip Execution',
    excelFileName: 'trip-execution.xlsx',
  };

  protected override facade = inject(TripExecutionFacadeService);
  protected override formService = inject(TripExecutionFormService);
  private readonly formSubmissionService = inject(FormSubmissionService);

  protected isAssigning = false;

  // ============================================================
  // Row Actions
  // ============================================================

  protected override onRowAction(
    action: string,
    row: TripExecution
  ): void {

    if (
      action === 'assigned' &&
      row.vehicle == null
    ) {
      this.assignResource(row);
      return;
    }

    this.dialog.showWarning(
      `Unknown row action: ${action}`
    );
  }

  // ============================================================
  // Initialize Trip Execution
  // ============================================================

  protected initializeTripExecution(): void {

    this.formSubmissionService.handleSave(
      this.mainForm,
      'Trip Execution',
      payload => {

        const request = {
          ...payload,
          doservice: formatDate(
            payload.doservice,
            'yyyy-MM-dd',
            'en-US'
          ),
        };

        this.facade
          .initializeTripExecution(request)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialog.showSuccess(
                'Trip execution initialized successfully.'
              );

              this.resetMainForm();
              this.facade.reload();
            },

            error: err => {
              this.dialog.showWarning(
                err.errorMessage
              );
            },
          });
      }
    );
  }

  // ============================================================
  // Cancel Form
  // ============================================================

  protected cancel(): void {
    this.resetMainForm();
  }

  // ============================================================
  // Resource Assignment
  // ============================================================

  private assignResource(row: TripExecution): void {

    this.isAssigning = true;

    this.facade
      .assignResource(row)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isAssigning = false;
        }),
      )
      .subscribe({
        next: () => {
          this.dialog.showSuccess(
            'Resource assigned successfully.'
          );
        },

        error: err => {
          this.dialog.showMessage({
            heading: 'Failed to assign resource',
            message: err.errorMessage,
          });
        },

        complete: () => {
          this.facade.reload();

          if (this.activeRow?.id === row.id) {
            this.activeRow = null;
          }
        },
      });
  }

  // ============================================================
  // Trip Status Transitions
  // ============================================================

  protected changeStatus(status: string): void {

    if (!this.activeRow) {
      return;
    }

    const id = this.activeRow.id;
    const statusKey = status.toLowerCase();

    const transitions: Record<
      string,
      () => Observable<TripExecution>
    > = {

      'checked in': () =>
        this.facade.checkedIn(id),

      'dispatched': () =>
        this.facade.dispatched(id),

      'in progress': () =>
        this.facade.inProgress(id),

      'arrived': () =>
        this.facade.arrived(id),

      'breakdown': () =>
        this.facade.breakdown(id),

      'completed': () =>
        this.facade.completed(id),

      'cancelled': () =>
        this.facade.cancelled(id),
    };

    const operation = transitions[statusKey];

    if (!operation) {
      this.dialog.showWarning(
        `Unknown status: ${status}`
      );
      return;
    }

    this.executeTransition(operation());
  }

  private executeTransition(
    operation$: Observable<TripExecution>
  ): void {

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialog.showSuccess(
            'Status updated successfully.'
          );
        },

        error: err => {
          this.dialog.showMessage({
            heading: 'Failed to update status',
            message: err.errorMessage,
          });
        },

        complete: () => {
          this.facade.reload();
          this.activeRow = null;
        },
      });
  }
}
