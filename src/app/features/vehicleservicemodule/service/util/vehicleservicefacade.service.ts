import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {VehicleService} from '../../entity/vehicleservice';
import {EMPTY_VEHICLE_SERVICE_METADATA, VehicleServiceMetadata} from '../../model/vehicleservice.metadata.model';
import {VehicleServiceService} from '../api/vehicleservice.service';
import {VehicleServiceMetadataService} from './vehicleservice.metadat.service';

@Injectable()
export class VehicleServiceFacadeService implements OnDestroy {

  // ===== State =====
  private vehicleServiceSubject      = new BehaviorSubject<VehicleService[]>([]);
  private metadataSubject = new BehaviorSubject<VehicleServiceMetadata>(EMPTY_VEHICLE_SERVICE_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly vehicleServices$     = this.vehicleServiceSubject.asObservable();
  readonly metadata$ = this.metadataSubject.asObservable();
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  constructor(
    private vehicleServiceService:VehicleServiceService,
    private metadataService: VehicleServiceMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<VehicleServiceMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchVehicleServices()),
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
    this.fetchVehicleServices();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchVehicleServices(params);
  }

  // ===== CRUD =====
  create(data: VehicleService): Observable<VehicleService> {
    return this.vehicleServiceService.save(data);
  }

  // ===== Status transitions =====
  startExecution(id: number): Observable<VehicleService> {return this.vehicleServiceService.startExecution(id);}
  placeOnHold(id: number): Observable<VehicleService> {return this.vehicleServiceService.placeOnHold(id);}
  complete(id: number): Observable<VehicleService> {return this.vehicleServiceService.complete(id);}


  // ===== Internal helpers =====
  private fetchVehicleServices(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.vehicleServiceService.get(params).pipe(
      map(res => res.data as VehicleService[]),
      tap(data => this.vehicleServiceSubject.next(data)),
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
