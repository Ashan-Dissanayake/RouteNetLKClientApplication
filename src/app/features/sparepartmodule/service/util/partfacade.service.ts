import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {Part} from '../../entity/part';
import {PartService} from '../api/part.service';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {EMPTY_PART_METADATA, PartMetadata} from '../../model/sparepart.metadata.model';
import {PartMetadataService} from './sparepart.metadata.service';

@Injectable()
export class PartFacadeService implements OnDestroy {

  // ===== State =====
  private partSubject     = new BehaviorSubject<Part[]>([]);
  private metadataSubject = new BehaviorSubject<PartMetadata>(EMPTY_PART_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly parts$    = this.partSubject.asObservable();
  readonly metadata$ = this.metadataSubject.asObservable();
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  constructor(
    private partService:     PartService,
    private metadataService: PartMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<PartMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchParts()),
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
    this.fetchParts();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchParts(params);
  }

  // ===== CRUD =====

  create(data: Part): Observable<Part> {
    return this.partService.save(data);
  }

  update(data: Part): Observable<Part> {
    return this.partService.update(data);
  }


  deactivate(parts: Part[]): Observable<number[]> {
    if (!parts || parts.length === 0) {
      return throwError(() => new Error('No parts selected.'));
    }

    const ids = parts
      .map(p => p.id!)
      .filter(id => id != null);

    return this.partService.deactivate(ids);
  }

  // ===== Internal helpers =====

  private fetchParts(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.partService.get(params).pipe(
      map(res => res.data as Part[]),
      tap(data => this.partSubject.next(data)),
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
