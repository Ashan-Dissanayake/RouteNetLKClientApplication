import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {PartRequest} from '../../entity/partrequest';
import {PartRequestService} from '../api/partrequest.service';
import {EMPTY_PART_REQUEST_METADATA, PartRequestMetadata} from '../../model/partrequest.metadata.model';
import {PartRequestMetadataService} from './partrequest.metadata.service';


@Injectable()
export class PartRequestFacadeService implements OnDestroy {

  // ===== State =====
  private partRequestSubject = new BehaviorSubject<PartRequest[]>([]);
  private metadataSubject    = new BehaviorSubject<PartRequestMetadata>(EMPTY_PART_REQUEST_METADATA);
  private loadingSubject     = new BehaviorSubject<boolean>(false);
  private errorSubject       = new BehaviorSubject<any>(null);
  private destroy$           = new Subject<void>();

  // ===== Public streams =====
  readonly partRequests$ = this.partRequestSubject.asObservable();
  readonly metadata$     = this.metadataSubject.asObservable();
  readonly loading$      = this.loadingSubject.asObservable();
  readonly error$        = this.errorSubject.asObservable();

  constructor(
    private partRequestService: PartRequestService,
    private metadataService:    PartRequestMetadataService,
  ) {}

  // ===== Lifecycle =====
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  initialize(): Observable<PartRequestMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchPartRequests()),
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
    this.fetchPartRequests();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchPartRequests(params);
  }

  // ===== CRUD =====
  create(data: PartRequest): Observable<PartRequest> {
    return this.partRequestService.save(data);
  }

  // ===== Status transitions =====
  approve(partRequest: PartRequest): Observable<PartRequest> {
    return this.partRequestService.approveRequest(partRequest.id);
  }

  reject(partRequest: PartRequest): Observable<PartRequest> {
    return this.partRequestService.rejectRequest(partRequest.id);
  }

  // ===== Internal helpers =====
  private fetchPartRequests(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.partRequestService.get(params).pipe(
      map(res => res.data as PartRequest[]),
      tap(data => this.partRequestSubject.next(data)),
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
