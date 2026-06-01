import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, takeUntil, tap } from 'rxjs/operators';
import {RosterSummary} from '../../entity/rostersummary';
import {RosterShift} from '../../entity/rostershift';
import {RosterShiftAssignment} from '../../entity/rostershiftassignment';
import {EMPTY_ROSTER_METADATA, RosterMetadata} from '../../model/roster.metadata.model';
import {RosterService} from '../api/roster.service';
import {RosterShiftService} from '../api/rostershift.service';
import {RosterShiftAssignmentService} from '../api/rostershiftassignment.service';
import {RosterMetadataService} from './roster.metadata.service';
import {Roster} from '../../entity/roster';
import {RosterMapper} from '../../../../shared/mappers/rosterMapper';

@Injectable()
export class RosterFacadeService implements OnDestroy {

  // ===== State =====
  private rosterSubject              = new BehaviorSubject<RosterSummary[]>([]);
  private rosterShiftSubject         = new BehaviorSubject<RosterShift[]>([]);
  private rosterShiftAssignmentSubject = new BehaviorSubject<RosterShiftAssignment[]>([]);
  private metadataSubject            = new BehaviorSubject<RosterMetadata>(EMPTY_ROSTER_METADATA);
  private loadingSubject             = new BehaviorSubject<boolean>(false);
  private errorSubject               = new BehaviorSubject<any>(null);
  private destroy$                   = new Subject<void>();

  // ===== Public streams =====
  readonly rosters$              = this.rosterSubject.asObservable();
  readonly rosterShifts$         = this.rosterShiftSubject.asObservable();
  readonly rosterShiftAssignments$ = this.rosterShiftAssignmentSubject.asObservable();
  readonly metadata$             = this.metadataSubject.asObservable();
  readonly loading$              = this.loadingSubject.asObservable();
  readonly error$                = this.errorSubject.asObservable();

  constructor(
    private rosterService:             RosterService,
    private rosterShiftService:        RosterShiftService,
    private rosterShiftAssignmentService: RosterShiftAssignmentService,
    private metadataService:           RosterMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<RosterMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchRosters()),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    );
  }

  // ===== Roster loading =====

  reload(): void {
    this.fetchRosters();
  }

  // ===== On-demand: shifts + assignments for a selected roster =====
  //
  // These are called when the user selects a roster from the list.
  // They are separate from initialization because they depend on
  // a user selection — we do not know which roster to load at startup.

  loadShiftsForRoster(rosterId: number): Observable<RosterShift[]> {
    this.setLoading(true);
    this.clearError();

    return this.rosterShiftService.get(rosterId).pipe(
      map(res => res.data as RosterShift[]),
      tap(data => this.rosterShiftSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    );
  }

  loadAssignmentsForRoster(rosterId: number): Observable<RosterShiftAssignment[]> {
    this.setLoading(true);
    this.clearError();

    return this.rosterShiftAssignmentService.get(rosterId).pipe(
      map(res => res.data as RosterShiftAssignment[]),
      tap(data => this.rosterShiftAssignmentSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    );
  }

  // ===== CRUD =====

  create(data: Roster): Observable<Roster> {
    return this.rosterService.save(RosterMapper.fromForm(data));
  }

  // ===== Domain operations =====

  /**
   * Triggers automatic crew assignment for a roster.
   * After completion the component reloads both shifts and assignments
   * for the current roster.
   */
  assignCrew(rosterId: number): Observable<RosterShiftAssignment> {
    return this.rosterShiftAssignmentService.assigned(rosterId);
  }

  /**
   * Approves a shift assignment by ID.
   */
  approveAssignment(assignmentId: number): Observable<RosterShiftAssignment> {
    return this.rosterShiftAssignmentService.approved(assignmentId);
  }

  /**
   * Rejects (cancels) a shift assignment by ID.
   */
  rejectAssignment(assignmentId: number): Observable<RosterShiftAssignment> {
    return this.rosterShiftAssignmentService.cancelled(assignmentId);
  }

  // ===== Internal helpers =====

  private fetchRosters(): void {
    this.setLoading(true);
    this.clearError();

    this.rosterService.getSummaries().pipe(
      map(res => res.data as RosterSummary[]),
      tap(data => this.rosterSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private setLoading(value: boolean): void { this.loadingSubject.next(value); }
  private clearError(): void               { this.errorSubject.next(null); }
}
