import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Branch} from '../../entity/branch';
import {BranchService} from '../api/branch.service';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {NumberService} from '../../../../core/number.service';
import {BranchMetadata, EMPTY_BRANCH_METADATA} from '../../model/branch.metadata.model';
import {BranchMetadataService} from './branch.metadata.service';

@Injectable()
export class BranchFacadeService implements OnDestroy{

  // ===== State =====
  private branchSubject = new BehaviorSubject<Branch[]>([]);
  private metadataSubject = new BehaviorSubject<BranchMetadata>(EMPTY_BRANCH_METADATA);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<any>(null);
  private destroy$            = new Subject<void>();

  // ===== Public streams =====
  branches$ = this.branchSubject.asObservable();
  metadata$ = this.metadataSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(
    private branchService:BranchService,
    private numberService:NumberService,
    private branchMetaDataService:BranchMetadataService
  ) {}

  // ===== Life Cycle =====
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  initialize(): Observable<BranchMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.branchMetaDataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchBranches()),
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
    this.fetchBranches();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchBranches(params);
  }

  // ===== CRUD =====
  create(data: Branch): Observable<Branch> {
    return this.branchService.save(data);
  }

  update(branchData: any): Observable<Branch> {
    return this.branchService.update(branchData);
  }

  deactivate(branches: Branch[]): Observable<number[]> {
    if (!branches || branches.length === 0) {
      return throwError(() => new Error('No branches selected.'));
    }

    const closedIds = branches
      .filter(b => (b.branchstatus?.name ?? '').toLowerCase() === 'closed')
      .map(b => b.id)
      .filter((id): id is number => id != null);

    if (closedIds.length === 0) {
      return throwError(() => new Error('Selected branches cannot be deactivated because none are closed.'));
    }

    return this.branchService.deactivate(closedIds);
  }

  // ===== Branch code and email generation =====

  loadBranchCode(branchName: string): Observable<string> {
    return this.numberService.getGeneratedBranchCode(branchName).pipe(
      map(res => res.data),
    );
  }

  generateEmail(branchCode: string): string | null {
    if (!branchCode) return null;
    const clean = branchCode.
    trim().toLowerCase().replace(/\s+/g, '.').substring(0, 3);
    return `${clean}@sltb.lk`;
  }

  // ===== Internal helpers =====
  private fetchBranches(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.branchService.get(params).pipe(
      map(res => res.data as Branch[]),
      tap(data => this.branchSubject.next(data)),
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
