import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {FareCollection} from '../entity/farecollection';
import {FareCollectionService} from './farecollection.service';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../core/search-criteria-normalizer';
import {EMPTY_FARE_COLLECTION_METADATA, FareCollectionMetadata} from '../meta/farecollection.metadata.model';
import {FareCollectionMetadataService} from './farecollection.metadata.service';

@Injectable()
export class FareCollectionFacadeService implements OnDestroy{

  // ===== State =====
  private fareCollectionSubject = new BehaviorSubject<FareCollection[]>([]);
  private metadataSubject = new BehaviorSubject<FareCollectionMetadata>(EMPTY_FARE_COLLECTION_METADATA);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<any>(null);
  private destroy$            = new Subject<void>();

  // ===== Public streams =====
  fareCollections$ = this.fareCollectionSubject.asObservable();
  metadata$ = this.metadataSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(
    private fareCollectionService:FareCollectionService,
    private fareCollectionMetaDataService:FareCollectionMetadataService
  ) {}

  // ===== Life Cycle =====
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  initialize(): Observable<FareCollectionMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.fareCollectionMetaDataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchFareCollections()),
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
    this.fetchFareCollections();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchFareCollections(params);
  }

  // ===== CRUD =====
  create(data: FareCollection): Observable<FareCollection> {
    return this.fareCollectionService.save(data);
  }

  // ===== Status transitions =====
  reconciled(row: FareCollection): Observable<FareCollection> {
    return this.fareCollectionService.reconciled(row.id);
  }

  // ===== Internal helpers =====
  private fetchFareCollections(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.fareCollectionService.get(params).pipe(
      map(res => res.data as FareCollection[]),
      tap(data => this.fareCollectionSubject.next(data)),
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
