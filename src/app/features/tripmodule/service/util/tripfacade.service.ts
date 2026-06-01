import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, takeUntil, tap } from 'rxjs/operators';
import {Trip} from '../../entity/trip';
import {EMPTY_TRIP_METADATA, TripMetadata} from '../../model/trip.metadata.model';
import {TripService} from '../api/trip.service';
import {TripMetadataService} from './trip.metadata.service';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';

@Injectable()
export class TripFacadeService implements OnDestroy {

  // ===== State =====
  private tripSubject     = new BehaviorSubject<Trip[]>([]);
  private metadataSubject = new BehaviorSubject<TripMetadata>(EMPTY_TRIP_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly trips$    = this.tripSubject.asObservable();
  readonly metadata$ = this.metadataSubject.asObservable();
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  constructor(
    private tripService:     TripService,
    private metadataService: TripMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<TripMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchTrips()),
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
    this.fetchTrips();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchTrips(params);
  }

  // ===== CRUD =====

  create(data: Trip): Observable<Trip> {
    return this.tripService.save(data);
  }

  update(data: Trip): Observable<Trip> {
    return this.tripService.update(data);
  }

  // ===== Status transitions =====

  activate(trip: Trip): Observable<Trip> {
    return this.tripService.activateTrip(trip.id);
  }

  suspend(trip: Trip): Observable<Trip> {
    return this.tripService.suspendTrip(trip.id);
  }

  discontinue(trip: Trip): Observable<Trip> {
    return this.tripService.discontinueTrip(trip.id);
  }

  // ===== Internal helpers =====

  private fetchTrips(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.tripService.get(params).pipe(
      map(res => res.data as Trip[]),
      tap(data => this.tripSubject.next(data)),
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
