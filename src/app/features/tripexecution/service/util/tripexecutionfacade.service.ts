import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {catchError, map} from 'rxjs/operators';
import {Branch} from '../../../branchmodule/entity/branch';
import {TripExecution} from '../../entity/tripexecution';
import {TripExecutionService} from '../api/tripexecution.service';
import {TripExecutionStatusService} from '../api/tripexecutionstatus.service';
import {TripExecutionStatus} from '../../entity/tripexecutionstatus';
import {Part} from '../../../sparepartmodule/entity/part';
import {EMPTY_PART_METADATA, PartMetadata} from '../../../sparepartmodule/model/sparepart.metadata.model';
import {EMPTY_TRIP_EXECUTION_METADATA, TripExecutionMetadata} from '../../model/tripexecution.metadata.model';
import {TripExecutionMetadataService} from './tripexecution.metadata.service';


@Injectable()
export class TripExecutionFacadeService implements OnDestroy {

  // ===== State =====
  private tripExecutionSubject = new BehaviorSubject<TripExecution[]>([]);
  private metadataSubject      = new BehaviorSubject<TripExecutionMetadata>(EMPTY_TRIP_EXECUTION_METADATA);
  private loadingSubject       = new BehaviorSubject<boolean>(false);
  private errorSubject         = new BehaviorSubject<any>(null);
  private destroy$             = new Subject<void>();

  // ===== Public streams =====
  readonly tripExecutions$ = this.tripExecutionSubject.asObservable();
  readonly metadata$       = this.metadataSubject.asObservable();
  readonly loading$        = this.loadingSubject.asObservable();
  readonly error$          = this.errorSubject.asObservable();

  constructor(
    private tripExecutionService: TripExecutionService,
    private metadataService:      TripExecutionMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<TripExecutionMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchTripExecutions()),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    );
  }

  // ===== Data loading =====

  reload(): void {
    this.fetchTripExecutions();
  }

  // ===== Domain operations =====

  /**
   * Initializes a new trip execution from the inline form payload.
   * Date formatting (doservice) is handled in the component before
   * this is called — keeping formatting as a UI concern.
   */
  initializeTripExecution(data: any): Observable<TripExecution> {
    return this.tripExecutionService.initialize(data);
  }

  /**
   * Assigns a vehicle and crew to a trip execution.
   * Derives the payload from the row data — component passes
   * the full row and the facade knows what the API needs.
   */
  assignResource(row: TripExecution): Observable<TripExecution> {
    const payload = {
      branchId: (row as any).branch.id,
      date:     (row as any).doservice,
    };
    return this.tripExecutionService.assignedResource(payload);
  }

  // ===== Status transitions =====
  // Each method delegates directly to the API service.
  // The component uses these via a transitions map so adding
  // a new status requires only one line there.

  checkedIn(id: number):  Observable<TripExecution> { return this.tripExecutionService.checkedIn(id); }
  dispatched(id: number): Observable<TripExecution> { return this.tripExecutionService.dispatched(id); }
  inProgress(id: number): Observable<TripExecution> { return this.tripExecutionService.inProgress(id); }
  arrived(id: number):    Observable<TripExecution> { return this.tripExecutionService.arrived(id); }
  breakdown(id: number):  Observable<TripExecution> { return this.tripExecutionService.breakdown(id); }
  completed(id: number):  Observable<TripExecution> { return this.tripExecutionService.completed(id); }
  cancelled(id: number):  Observable<TripExecution> { return this.tripExecutionService.cancelled(id); }

  // ===== Internal helpers =====

  private fetchTripExecutions(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.tripExecutionService.get(params).pipe(
      map(res => res.data as TripExecution[]),
      tap(data => this.tripExecutionSubject.next(data)),
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
