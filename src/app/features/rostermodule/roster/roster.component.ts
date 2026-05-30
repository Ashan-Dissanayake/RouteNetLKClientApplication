import { Component } from '@angular/core';
import {ROSTER_MAIN_FORM_META, ROSTER_SHIFT_TABLE_META} from '../roster.meta';
import {async, finalize, Observable, Subject, takeUntil} from 'rxjs';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {RosterFacadeService} from '../rosterfacade.service';
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
  standalone:true
})
export class RosterComponent {

  // ===== Meta Data =====
  protected readonly mainFormMeta = ROSTER_MAIN_FORM_META;
  protected readonly tableColumns = ROSTER_SHIFT_TABLE_META;

  // ===== Reactive State =====
  protected rosters$: Observable<RosterSummary[]>;
  protected rosterShifts$: Observable<RosterShift[]>;
  protected rosterShiftsAssignments$: Observable<RosterShiftAssignment[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  protected readonly async = async;

  // ===== Forms =====
  protected mainForm: FormGroup = new FormGroup({});

  selectedRosterId: number | null = null;
  isAssigning = false;

  constructor(
    private rosterFacade: RosterFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    this.rosters$ = this.rosterFacade.roster$;
    this.rosterShifts$ = this.rosterFacade.rosterShift$;
    this.rosterShiftsAssignments$ = this.rosterFacade.rosterShiftAssignment$;
    this.metadata$ = this.rosterFacade.metadata$;
    this.loading$ = this.rosterFacade.loading$;
    this.error$ = this.rosterFacade.error$;
  }


  ngOnInit(): void {
    this.initializeModule();
    this.metadata$.pipe(takeUntil(this.destroy$)).subscribe(metadata => {
      this.createMainForm(metadata);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected reload(): void { this.rosterFacade.reloadRosters(); }

  private initializeModule() {
    this.rosterFacade.initializeRosterModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize roster module.', err)
      });
  }

  private createMainForm(metadata: any): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      branch: metadata.branches,
    });
  }

  protected save(): void {
    this.formBuilderService.handleSave(this.mainForm, 'Roster', (payload) => {
      this.rosterFacade.createRoster(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Roster saved successfully.');
            this.formBuilderService.resetForm(this.mainForm);
            this.reload();
          },
          error: (err) => this.dialogService.showWarning('Error', err.errorMessage)
        });
    });
  }

  protected cancel() :void{
      this.formBuilderService.resetForm(this.mainForm);
   }

  protected assignedCrew(): void {
    if (!this.selectedRosterId) return;
    this.isAssigning = true;

    this.rosterFacade.assignedCrew(this.selectedRosterId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isAssigning = false)
      )
      .subscribe({
        next: () => {
          this.dialogService.showSuccess('Crew assigned successfully.');
          this.rosterFacade.loadRosterShifts(this.selectedRosterId!).subscribe();
          this.rosterFacade.loadRosterShiftAssignments(this.selectedRosterId!).subscribe();
        },
        error: (err) => this.dialogService.showError('Assignment Failed', err)
      });
  }

  protected approvedAss(id: number): void {
    this.rosterFacade.approvedAss(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogService.showSuccess('Approved successfully.');
          if (this.selectedRosterId) {
            this.rosterFacade.loadRosterShiftAssignments(this.selectedRosterId).subscribe();
          }
        },
        error: (err) => this.dialogService.showMessage({
          heading: 'Failed to approve',
          message: err.errorMessage
        })
      });
  }

  protected rejectAss(id: number): void {
    this.rosterFacade.rejectAss(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogService.showSuccess('Rejected successfully.');
          if (this.selectedRosterId) {
            this.rosterFacade.loadRosterShiftAssignments(this.selectedRosterId).subscribe();
          }
        },
        error: (err) => this.dialogService.showMessage({
          heading: 'Failed to reject',
          message: err.errorMessage
        })
      });
  }

  protected onRosterSelected(rosterId: number): void {
    if (!rosterId) return;
    this.selectedRosterId = rosterId;

    this.rosterFacade.loadRosterShifts(rosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.rosterFacade.loadRosterShiftAssignments(rosterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  protected trackByRosterId(index: number, roster: any): number {
    return roster.id;
 }

}
