import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {Permit} from '../../entity/permit';
import {PermitService} from '../api/permit.service';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {EMPTY_PERMIT_METADATA, PermitMetadata} from '../../model/permit.metadata.model';
import {PermitMetadataService} from './permit.metadata.service';

@Injectable()
export class PermitFacadeService implements OnDestroy {

  // ===== State =====
  private permitSubject   = new BehaviorSubject<Permit[]>([]);
  private metadataSubject = new BehaviorSubject<PermitMetadata>(EMPTY_PERMIT_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly permits$  = this.permitSubject.asObservable();
  readonly metadata$ = this.metadataSubject.asObservable();
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  constructor(
    private permitService:   PermitService,
    private metadataService: PermitMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<PermitMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchPermits()),
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
    this.fetchPermits();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchPermits(params);
  }

  // ===== CRUD =====

  create(data: Permit): Observable<Permit> {
    return this.permitService.save(data);
  }

  // ===== Domain operations =====

  /**
   * Transfers a permit. This is a domain-level status transition —
   * not a CRUD operation — so it lives in the facade alongside
   * other domain operations.
   */
  transfer(permitId: number): Observable<Permit> {
    return this.permitService.transferPermit(permitId);
  }

  // ===== Internal helpers =====

  private fetchPermits(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.permitService.get(params).pipe(
      map(res => res.data as Permit[]),
      tap(data => this.permitSubject.next(data)),
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
