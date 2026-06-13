import {Injectable, OnDestroy} from '@angular/core';
import {VehicleService} from '../api/vehicle.service';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Vehicle} from '../../entity/vehicle';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {EMPTY_VEHICLE_METADATA, VehicleMetadata} from '../../model/vehicle.metadata.model';
import {VehicleMetadataService} from './vehicle.metadata.service';

@Injectable()
export class VehicleFacadeService implements OnDestroy {

  // ===== State =====
  private vehicleSubject  = new BehaviorSubject<Vehicle[]>([]);
  private metadataSubject = new BehaviorSubject<VehicleMetadata>(EMPTY_VEHICLE_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly vehicles$ = this.vehicleSubject.asObservable();
  readonly metadata$ = this.metadataSubject.asObservable();
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  constructor(
    private vehicleService:  VehicleService,
    private metadataService: VehicleMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<VehicleMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchVehicles()),
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
    this.fetchVehicles();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchVehicles(params);
  }

  // ===== CRUD =====

  /**
   * Domain validation before create:
   * - Status must be 'available'
   * - Condition rate must not be 'poor' or 'critical'
   * Both conditions must pass — a vehicle in poor/critical condition
   * should not enter service even if marked available.
   */
  create(data: Vehicle): Observable<Vehicle> {
    const status        = (data.vehiclestatus?.name ?? '').toLowerCase();
    const conditionRate = (data.conditionrate?.name ?? '').toLowerCase();
    const blockedRates  = ['poor', 'critical'];

    if (status !== 'available' || blockedRates.includes(conditionRate)) {
      return throwError(() =>
        new Error('Vehicle must be Available and not in Poor or Critical condition to be created.')
      );
    }

    return this.vehicleService.save(data);
  }

  update(data: Vehicle): Observable<Vehicle> {
    return this.vehicleService.update(data);
  }

  /**
   * Deactivates only vehicles with status 'decommissioned' or 'out of service'.
   * Returns an error Observable if no qualifying vehicles are in the selection.
   */
  deactivate(vehicles: Vehicle[]): Observable<number[]> {
    if (!vehicles || vehicles.length === 0) {
      return throwError(() => new Error('No vehicles selected.'));
    }

    const allowedStatuses = ['decommissioned', 'out of service'];

    const qualifyingIds = vehicles
      .filter(v => allowedStatuses.includes((v.vehiclestatus?.name ?? '').toLowerCase()))
      .map(v => v.id!)
      .filter(id => id != null);

    if (qualifyingIds.length === 0) {
      return throwError(() =>
        new Error('Only vehicles with status Out of Service or Decommissioned can be deactivated.')
      );
    }

    return this.vehicleService.deactivate(qualifyingIds);
  }

  // ===== Internal helpers =====

  private fetchVehicles(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.vehicleService.get(params).pipe(
      map(res => res.data as Vehicle[]),
      tap(data => this.vehicleSubject.next(data)),
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
