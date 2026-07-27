import {Component, OnDestroy, OnInit} from '@angular/core';
import {ROSTER_MAIN_FORM_META, ROSTER_SHIFT_TABLE_META} from '../model/roster.meta';
import {finalize, Observable, Subject, takeUntil} from 'rxjs';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {RosterFacadeService} from '../service/util/rosterfacade.service';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {Roster} from '../entity/roster';
import {MatFormField, MatLabel, MatOption, MatSelect} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';
import {RosterSummary} from '../entity/rostersummary';
import {RosterShift} from '../entity/rostershift';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RosterShiftAssignment} from '../entity/rostershiftassignment';
import {RosterMetadata} from '../model/roster.metadata.model';
import {RosterFormService} from '../service/util/rosterfrom.service';
import {RosterMetadataService} from '../service/util/roster.metadata.service';

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
    MatProgressSpinner
  ],
  templateUrl: './roster.component.html',
  styleUrl: './roster.component.scss',
  standalone:true,
  providers: [
    RosterFacadeService,
    RosterFormService,
    RosterMetadataService,
  ],
})
export class RosterComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly mainFormMeta  = ROSTER_MAIN_FORM_META;
  protected readonly tableColumns  = ROSTER_SHIFT_TABLE_META;

  // ===== Streams =====
  protected readonly rosters$:               Observable<RosterSummary[]>;
  protected readonly rosterShifts$:          Observable<RosterShift[]>;
  protected readonly rosterShiftAssignments$: Observable<RosterShiftAssignment[]>;
  protected readonly metadata$:              Observable<RosterMetadata>;
  protected readonly loading$:               Observable<boolean>;
  protected readonly error$:                 Observable<any>;

  // ===== UI state =====
  // selectedRosterId drives the on-demand shift + assignment loading.
  // isAssigning is a separate flag for the crew assignment operation
  // so it does not interfere with the global loading spinner.
  protected selectedRosterId: number | null = null;
  protected isAssigning = false;

  // ===== Form =====
  // Roster uses an inline form with handleSave() — not a dialog popup.
  // The form is held here for template binding.
  protected mainForm: FormGroup = new FormGroup({});

  private destroy$ = new Subject<void>();

  constructor(
    private facade:      RosterFacadeService,
    private formService: RosterFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.rosters$                = this.facade.rosters$;
    this.rosterShifts$           = this.facade.rosterShifts$;
    this.rosterShiftAssignments$ = this.facade.rosterShiftAssignments$;
    this.metadata$               = this.facade.metadata$;
    this.loading$                = this.facade.loading$;
    this.error$                  = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize roster module.', err),
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

  // ===== Roster selection =====
  //
  // When the user picks a roster, load its shifts and assignments
  // on demand. These are not available at init — they depend on
  // which roster the user selects.

  protected onRosterSelected(rosterId: number): void {
    if (!rosterId) return;
    this.selectedRosterId = rosterId;

    this.facade.loadShiftsForRoster(rosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.facade.loadAssignmentsForRoster(rosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  // ===== Inline form save =====
  //
  // Roster uses handleSave() which internally handles validation
  // and the confirmation dialog — different from other modules
  // that use showFormPopup(). This is an inline form on the page.

  protected save(): void {
    this.formBuilder.handleSave(this.mainForm, 'Roster', payload => {
      this.facade.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialog.showSuccess('Roster created successfully.');
            this.formBuilder.resetForm(this.mainForm);
            this.facade.reload();
          },
          error: err => this.dialog.showErrorMessage('Deactivation failed', err),
        });
    });
  }

  protected cancel(): void {
    this.formBuilder.resetForm(this.mainForm);
  }

  // ===== Crew assignment =====
  //
  // Uses isAssigning instead of the global loading flag so the
  // assignment button can show its own loading state without
  // triggering the page-level progress bar.
  // After completion both shifts and assignments are reloaded
  // because assigning crew populates both.

  protected assignCrew(): void {
    if (!this.selectedRosterId) return;
    this.isAssigning = true;

    this.facade.assignCrew(this.selectedRosterId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isAssigning = false),
    ).subscribe({
      next: () => {
        this.dialog.showSuccess('Crew assigned successfully.');
        this.reloadShiftsAndAssignments();
      },
      error: err => this.dialog.showError('Assignment failed.', err),
    });
  }

  // ===== Assignment transitions =====
  //
  // approveAssignment and rejectAssignment only reload assignments —
  // shifts are not affected by approval/rejection.

  protected approveAssignment(assignmentId: number): void {
    this.facade.approveAssignment(assignmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialog.showSuccess('Assignment approved successfully.');
          this.reloadAssignments();
        },
        error: err => this.dialog.showError('Assignment failed.', err),
      });
  }

  protected rejectAssignment(assignmentId: number): void {
    this.facade.rejectAssignment(assignmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialog.showSuccess('Assignment rejected successfully.');
          this.reloadAssignments();
        },
        error: err => this.dialog.showError('Assignment failed.', err),
      });
  }

  // ===== Private reload helpers =====
  //
  // Extracted so the reload logic for the selected roster
  // is not repeated across multiple handlers.

  private reloadShiftsAndAssignments(): void {
    if (!this.selectedRosterId) return;
    this.facade.loadShiftsForRoster(this.selectedRosterId)
      .pipe(takeUntil(this.destroy$)).subscribe();
    this.facade.loadAssignmentsForRoster(this.selectedRosterId)
      .pipe(takeUntil(this.destroy$)).subscribe();
  }

  private reloadAssignments(): void {
    if (!this.selectedRosterId) return;
    this.facade.loadAssignmentsForRoster(this.selectedRosterId)
      .pipe(takeUntil(this.destroy$)).subscribe();
  }

  // ===== Template helper =====

  protected trackByRosterId(_: number, roster: RosterSummary): number {
    return roster.id;
  }
}
