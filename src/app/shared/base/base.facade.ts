import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { normalizeSearchCriteria } from '../../core/search-criteria-normalizer';

@Injectable()
export abstract class BaseFacade<TEntity, TMetadata> implements OnDestroy {

  protected itemsSubject = new BehaviorSubject<TEntity[]>([]);
  protected metadataSubject: BehaviorSubject<TMetadata>;
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  protected errorSubject = new BehaviorSubject<any>(null);
  protected destroy$ = new Subject<void>();

  readonly items$ = this.itemsSubject.asObservable();
  readonly metadata$: Observable<TMetadata>;
  readonly loading$  = this.loadingSubject.asObservable();
  readonly error$    = this.errorSubject.asObservable();

  protected constructor(

    protected apiService: {
      get(params?: any): Observable<{ data: TEntity[] }>;
      save?(data: TEntity): Observable<TEntity>;
      update?(data: TEntity): Observable<TEntity>;
      deactivate?(ids: number[]): Observable<number[]>;
    },

    protected metadataService: {
      loadAll(): Observable<TMetadata>;
    },

    emptyMetadata: TMetadata

  ) {
    this.metadataSubject = new BehaviorSubject<TMetadata>(emptyMetadata);
    this.metadata$ = this.metadataSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initialize(): Observable<TMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchItems()),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    );
  }

  reload(): void {
    this.fetchItems();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchItems(params);
  }

  create(data: TEntity): Observable<TEntity> {

    if (!this.apiService.save) {
      return throwError(() => new Error('Save operation is not implemented.'));
    }

    const validationError = this.validateCreate(data);

    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    return this.apiService.save(
      this.beforeCreate(data)
    );
  }

  update(data: TEntity): Observable<TEntity> {
    if (!this.apiService.update) {
      return throwError(() =>
        new Error('Update operation is not implemented for this service.')
      );
    }

    const validationError = this.validateUpdate(data);

    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    return this.apiService.update(
      this.beforeUpdate(data)
    );
  }

  deactivate(items: TEntity[]): Observable<number[]> {
    if (!this.apiService.deactivate) {
      return throwError(() => new Error('Deactivate operation is not implemented for this service.'));
    }
    if (!items || items.length === 0) {
      return throwError(() => new Error('No items selected.'));
    }

    const ids = this.getDeactivationIds(items);
    if (ids.length === 0) {
      return throwError(() => new Error(this.getNoQualifyingDeactivateErrorMessage()));
    }

    return this.apiService.deactivate(ids);
  }

  protected fetchItems(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.apiService.get(params).pipe(
      map(res => res.data as TEntity[]),
      tap(data => this.itemsSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected setLoading(value: boolean): void { this.loadingSubject.next(value); }
  protected clearError(): void               { this.errorSubject.next(null); }

  // Extensibility Hooks
  protected validateCreate(data: TEntity): string | null { return null; }
  protected getDeactivationIds(items: TEntity[]): number[] { return []; }
  protected getNoQualifyingDeactivateErrorMessage(): string { return 'No qualifying items could be deactivated.'; }
  protected beforeCreate(data: TEntity): TEntity {return data;}
  protected beforeUpdate(data: TEntity): TEntity {return data;}
  protected validateUpdate(data: TEntity): string | null {return null;}
}
