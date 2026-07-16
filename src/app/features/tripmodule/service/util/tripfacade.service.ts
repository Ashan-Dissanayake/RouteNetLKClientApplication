import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, takeUntil, tap } from 'rxjs/operators';
import {Trip} from '../../entity/trip';
import {EMPTY_TRIP_METADATA, TripMetadata} from '../../model/trip.metadata.model';
import {TripService} from '../api/trip.service';
import {TripLookupDataService} from './trip.lookupdata.service';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';

/**
 * Facade service for managing trips and their metadata.
 * Provides state management, data loading, and CRUD operations for trips.
 */
@Injectable()
export class TripFacadeService implements OnDestroy {

  // ===== State =====
  /** Subject to manage the list of trips. */
  private tripSubject = new BehaviorSubject<Trip[]>([]);

  /** Subject to manage trip metadata. */
  private metadataSubject = new BehaviorSubject<TripMetadata>(EMPTY_TRIP_METADATA);

  /** Subject to manage the loading state. */
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /** Subject to manage errors. */
  private errorSubject = new BehaviorSubject<any>(null);

  /** Subject to handle component destruction. */
  private destroy$ = new Subject<void>();

  // ===== Public streams =====

  /** Observable stream of trips. */
  readonly trips$ = this.tripSubject.asObservable();

  /** Observable stream of trip metadata. */
  readonly metadata$ = this.metadataSubject.asObservable();

  /** Observable stream of the loading state. */
  readonly loading$ = this.loadingSubject.asObservable();

  /** Observable stream of errors. */
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Constructor for the TripFacadeService.
   * @param tripService Service for interacting with trip-related APIs.
   * @param metadataService Service for interacting with trip metadata APIs.
   */
  constructor(
    private tripService: TripService,
    private metadataService: TripLookupDataService,
  ) {}

  // ===== Lifecycle =====

  /**
   * Lifecycle hook to clean up resources when the service is destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  /**
   * Initializes the service by loading trip metadata and fetching trips.
   * @returns Observable of the loaded trip metadata.
   */
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

  /**
   * Reloads the list of trips.
   */
  reload(): void {
    this.fetchTrips();
  }

  /**
   * Filters trips based on the provided criteria.
   * @param criteria Object containing search criteria for filtering trips.
   */
  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchTrips(params);
  }

  // ===== CRUD =====

  /**
   * Creates a new trip.
   * @param data Trip data to be created.
   * @returns Observable of the created trip.
   */
  create(data: Trip): Observable<Trip> {
    return this.tripService.save(data);
  }

  /**
   * Updates an existing trip.
   * @param data Trip data to be updated.
   * @returns Observable of the updated trip.
   */
  update(data: Trip): Observable<Trip> {
    return this.tripService.update(data);
  }

  // ===== Status transitions =====

  /**
   * Activates a trip.
   * @param trip Trip to be activated.
   * @returns Observable of the activated trip.
   */
  activate(trip: Trip): Observable<Trip> {
    return this.tripService.activateTrip(trip.id);
  }

  /**
   * Suspends a trip.
   * @param trip Trip to be suspended.
   * @returns Observable of the suspended trip.
   */
  suspend(trip: Trip): Observable<Trip> {
    return this.tripService.suspendTrip(trip.id);
  }

  /**
   * Discontinues a trip.
   * @param trip Trip to be discontinued.
   * @returns Observable of the discontinued trip.
   */
  discontinue(trip: Trip): Observable<Trip> {
    return this.tripService.discontinueTrip(trip.id);
  }

  // ===== Internal helpers =====

  /**
   * Fetches trips from the API and updates the state.
   * @param params Optional parameters for fetching trips.
   */
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

  /**
   * Updates the loading state.
   * @param value Boolean indicating whether loading is in progress.
   */
  private setLoading(value: boolean): void {
    this.loadingSubject.next(value);
  }

  /**
   * Clears the current error state.
   */
  private clearError(): void {
    this.errorSubject.next(null);
  }
}
