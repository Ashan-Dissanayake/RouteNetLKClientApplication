import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ROSTER_MAIN_FORM_META, ROSTER_SHIFT_TABLE_META} from '../model/roster.meta';
import {finalize, Subject, takeUntil} from 'rxjs';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../shared/services/dialog.service';
import {FormbuilderService} from '../../../shared/services/formbuilder.service';
import {RosterFacadeService} from '../service/util/rosterfacade.service';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatFormField, MatLabel, MatOption, MatSelect} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';
import {RosterSummary} from '../entity/rostersummary';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RosterFormService} from '../service/util/rosterfrom.service';
import {RosterMetadataService} from '../service/util/roster.metadata.service';
import {FormSubmissionService} from '../../../shared/services/formsubmission.service';

@Component({
  selector: 'app-roster',
  imports: [
    AsyncPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
    NgIf,
    DynamicFieldComponent,
    NgForOf,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatLabel,
    MatFormField,
    MatCardHeader,
    MatIconButton,
    MatIcon,
    DatePipe,
    DataTableComponent,
    MatTooltip,
    MatProgressSpinner,
  ],
  templateUrl: './roster.component.html',
  styleUrl: './roster.component.scss',
  standalone: true,
  providers: [
    RosterFacadeService,
    RosterFormService,
    RosterMetadataService,
  ],
})
export class RosterComponent implements OnInit, OnDestroy {

  protected readonly mainFormMeta = ROSTER_MAIN_FORM_META;
  protected readonly tableColumns = ROSTER_SHIFT_TABLE_META;

  private readonly facade = inject(RosterFacadeService);
  private readonly formService = inject(RosterFormService);
  private readonly formBuilder = inject(FormbuilderService);
  private readonly formSubmission = inject(FormSubmissionService);
  private readonly dialog = inject(DialogService);

  protected readonly rosters$ = this.facade.rosters$;
  protected readonly rosterShifts$ = this.facade.rosterShifts$;
  protected readonly rosterShiftAssignments$ = this.facade.rosterShiftAssignments$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  protected selectedRosterId: number | null = null;
  protected isAssigning = false;

  protected mainForm: FormGroup =
    new FormGroup({});

  private readonly destroy$ =
    new Subject<void>();

  constructor() {
  }

  ngOnInit(): void {

    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err =>
          this.dialog.showError(
            'Failed to initialize roster module.',
            err
          ),
      });

    this.facade.metadata$
      .pipe(takeUntil(this.destroy$))
      .subscribe(metadata => {
        this.mainForm =
          this.formService.buildMainForm(metadata);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected reload(): void {
    this.facade.reload();
  }

  protected onRosterSelected(rosterId: number): void {

    if (!rosterId) {
      return;
    }

    this.selectedRosterId = rosterId;

    this.facade
      .loadShiftsForRoster(rosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.facade
      .loadAssignmentsForRoster(rosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  protected save(): void {

    this.formSubmission.handleSave(
      this.mainForm,
      'Roster',
      payload => {

        this.facade
          .create(payload)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialog.showSuccess(
                'Roster created successfully.'
              );

              this.formBuilder.resetForm(
                this.mainForm
              );

              this.facade.reload();
            },

            error: err =>
              this.dialog.showErrorMessage(
                'Failed to create roster',
                err
              ),
          });
      }
    );
  }

  protected cancel(): void {
    this.formBuilder.resetForm(this.mainForm);
  }

  protected assignCrew(): void {

    if (!this.selectedRosterId) {
      return;
    }

    this.isAssigning = true;

    this.facade
      .assignCrew(this.selectedRosterId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isAssigning = false;
        }),
      )
      .subscribe({
        next: () => {
          this.dialog.showSuccess(
            'Crew assigned successfully.'
          );

          this.reloadShiftsAndAssignments();
        },

        error: err =>
          this.dialog.showError(
            'Assignment failed.',
            err
          ),
      });
  }

  protected approveAssignment(
    assignmentId: number
  ): void {

    this.facade
      .approveAssignment(assignmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialog.showSuccess(
            'Assignment approved successfully.'
          );

          this.reloadAssignments();
        },

        error: err =>
          this.dialog.showError(
            'Assignment failed.',
            err
          ),
      });
  }

  protected rejectAssignment(
    assignmentId: number
  ): void {

    this.facade
      .rejectAssignment(assignmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialog.showSuccess(
            'Assignment rejected successfully.'
          );

          this.reloadAssignments();
        },

        error: err =>
          this.dialog.showError(
            'Assignment failed.',
            err
          ),
      });
  }

  private reloadShiftsAndAssignments(): void {

    if (!this.selectedRosterId) {
      return;
    }

    this.facade
      .loadShiftsForRoster(this.selectedRosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.facade
      .loadAssignmentsForRoster(this.selectedRosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private reloadAssignments(): void {

    if (!this.selectedRosterId) {
      return;
    }

    this.facade
      .loadAssignmentsForRoster(this.selectedRosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  protected trackByRosterId(
    _: number,
    roster: RosterSummary
  ): number {
    return roster.id;
  }
}
