import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {Grn} from '../../entity/grn';
import {GrnService} from '../api/grn.service';
import {EMPTY_GRN_METADATA, GrnMetadata} from '../../model/grn.metadata.model';
import {GrnMetadataService} from './grn.metadata.service';

@Injectable()
export class GrnFacadeService implements OnDestroy {

  // ===== State =====
  private grnSubject      = new BehaviorSubject<Grn[]>([]);
  private metadataSubject = new BehaviorSubject<GrnMetadata>(EMPTY_GRN_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly grns$     = this.grnSubject.asObservable();
  readonly metadata$ = this.metadataSubject.asObservable();
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  constructor(
    private grnService:      GrnService,
    private metadataService: GrnMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<GrnMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchGrns()),
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
    this.fetchGrns();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchGrns(params);
  }

  // ===== CRUD =====
  // GRN module has no create or deactivate — only update.

  update(data: Grn): Observable<Grn> {
    return this.grnService.update(data);
  }

  // ===== Internal helpers =====

  private fetchGrns(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.grnService.get(params).pipe(
      map(res => res.data as Grn[]),
      tap(data => this.grnSubject.next(data)),
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
