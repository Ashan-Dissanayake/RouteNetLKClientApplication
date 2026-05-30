import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ConductorService} from '../api/conductor.service';
import {Conductor} from '../../entity/conductor';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {ConductorMapper} from '../../../../shared/mappers/ConductorMapper';
import {ConductorMetadata, EMPTY_CONDUCTOR_METADATA} from '../../model/conductor.metadata.model';
import {ConductorMetadataService} from './conductor.metadata.service';

@Injectable()
export class ConductorFacadeService implements OnDestroy {

  // ===== State =====
  private conductorSubject = new BehaviorSubject<Conductor[]>([]);
  private metadataSubject  = new BehaviorSubject<ConductorMetadata>(EMPTY_CONDUCTOR_METADATA);
  private loadingSubject   = new BehaviorSubject<boolean>(false);
  private errorSubject     = new BehaviorSubject<any>(null);
  private destroy$         = new Subject<void>();

  // ===== Public streams =====
  readonly conductors$ = this.conductorSubject.asObservable();
  readonly metadata$   = this.metadataSubject.asObservable();
  readonly loading$    = this.loadingSubject.asObservable();
  readonly error$      = this.errorSubject.asObservable();

  constructor(
    private conductorService: ConductorService,
    private metadataService:  ConductorMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<ConductorMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchConductors()),
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
    this.fetchConductors();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchConductors(params);
  }

  // ===== CRUD =====

  /**
   * Only allows creation when conductor crew status is 'eligible'.
   * Applies ConductorMapper before sending to the API.
   */
  create(data: Conductor): Observable<Conductor> {
    const status = data.crewstatus?.name?.toLowerCase();
    if (status !== 'eligible') {
      return throwError(() => new Error('Conductor must have an eligible status to be created.'));
    }
    return this.conductorService.save(ConductorMapper.fromForm(data));
  }

  update(data: Conductor): Observable<Conductor> {
    return this.conductorService.update(ConductorMapper.fromForm(data));
  }

  // ===== Snapshot helper =====

  /**
   * Returns the current conductors list synchronously.
   * Used by FormService to derive the employee list for edit mode.
   */
  getConductorsSnapshot(): Conductor[] {
    return this.conductorSubject.getValue();
  }

  // ===== Internal helpers =====

  private fetchConductors(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.conductorService.get(params).pipe(
      map(res => res.data as Conductor[]),
      tap(data => this.conductorSubject.next(data)),
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
