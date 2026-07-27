import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DriverService} from '../api/driver.service';
import {Driver} from '../../entity/driver';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {Regex} from '../../../../shared/models/regex.model';
import {RegexService} from '../../../../core/regex.service';
import {DriverMapper} from '../../../../shared/mappers/DriverMapper';
import {DriverMetadata, EMPTY_DRIVER_METADATA} from '../../model/driver.metadata.model';
import {DriverMetadataService} from './driver.metadata.service';

@Injectable()
export class DriverFacadeService implements OnDestroy {

  // ===== State =====
  private driverSubject   = new BehaviorSubject<Driver[]>([]);
  private metadataSubject = new BehaviorSubject<DriverMetadata>(EMPTY_DRIVER_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly drivers$  = this.driverSubject.asObservable();
  readonly metadata$ = this.metadataSubject.asObservable();
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  constructor(
    private driverService:   DriverService,
    private metadataService: DriverMetadataService,
    private regexService:    RegexService,
  ) {}

  // ===== Lifecycle =====
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  initialize(): Observable<DriverMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchDrivers()),
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
    this.fetchDrivers();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchDrivers(params);
  }

  // ===== CRUD =====
  create(data: Driver): Observable<Driver> {
    const status = data.crewstatus?.name?.toLowerCase();
    if (status !== 'eligible') {
      return throwError(() => new Error('Driver must have an eligible status to be created.'));
    }
    return this.driverService.save(DriverMapper.fromForm(data));
  }

  update(data: Driver): Observable<Driver> {
    return this.driverService.update(DriverMapper.fromForm(data));
  }

  // ===== Dynamic regex loading =====
  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('drivers').pipe(
      map(res => res.data),
    );
  }

  // ===== Snapshot helper =====
  getDriversSnapshot(): Driver[] {
    return this.driverSubject.getValue();
  }

  // ===== Internal helpers =====
  private fetchDrivers(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.driverService.get(params).pipe(
      map(res => res.data as Driver[]),
      tap(data => this.driverSubject.next(data)),
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
