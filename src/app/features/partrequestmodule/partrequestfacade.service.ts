import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Branch} from '../branchmodule/entity/branch';
import {BranchService} from '../branchmodule/services/branch.service';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {PartRequest} from './entity/partrequest';
import {PartRequestService} from './service/partrequest.service';
import {PartRequestStatusService} from './service/partrequeststatus.service';
import {PartRequestStatus} from './entity/partrequeststatus';
import {PartMasterService} from '../sparepartmodule/service/partmaster.service';
import {PartMaster} from '../sparepartmodule/entity/partmaster';
import {PartService} from '../sparepartmodule/service/part.service';
import {Part} from '../sparepartmodule/entity/part';

@Injectable({
  providedIn: 'root',
})
export class PartRequestFacadeService {

  private partRequestsSubject = new BehaviorSubject<PartRequest[]>([]);
  partRequests$ = this.partRequestsSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private partRequestService:PartRequestService,
    private partRequestStatusService:PartRequestStatusService,
    private branchService:BranchService,
    // private partMasterService:PartMasterService,
    private partService:PartService,
  ) {}

  private clearError(): void { this.errorSubject.next(null); }

  initializePartRequestModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      partRequestStatuses:this.loadPartRequestStatuses(),
      // partMasters:this.loadPartMasters(),
      parts:this.loadParts(),
      branches:this.loadBranches(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshPartRequests()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadPartRequests(): void { this.refreshPartRequests(); }

  loadPartRequests(params?:any):Observable<PartRequest[]>{
      this.loadingSubject.next(true);
      this.clearError();
      return this.partRequestService.get(params).pipe(
        map(res=>res.data as PartRequest[]),
        tap(data=>this.partRequestsSubject.next(data)),
        catchError(err => {
          this.errorSubject.next(err);
          return throwError(()=>err)}
        )
      );
  }

  filterPartRequests(criteria: Record<string, any>): void {
    const normalized = normalizeSearchCriteria(criteria);
    this.loadPartRequests(normalized)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        error: err => this.errorSubject.next(err)
      });
  }

  createPartRequest(partRequestData: PartRequest): Observable<PartRequest> {
      return this.partRequestService.save(partRequestData);
  }

  approvedPartRequest(partRequest: PartRequest) :Observable<PartRequest>{
    return this.partRequestService.approveRequest(partRequest.id);
  }

  rejectPartRequest(partRequest: PartRequest) :Observable<PartRequest>{
    return this.partRequestService.rejectRequest(partRequest.id);
  }

  // ===== Metadata Loading =====
  loadPartRequestStatuses(): Observable<PartRequestStatus[]> { return this.partRequestStatusService.get().pipe(map(res => res.data)); }
  loadParts(): Observable<Part[]> { return this.partService.getSummary().pipe(map(res => res.data)); }
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}

  // ===== Private Helpers =====
  private refreshPartRequests(): void {
    this.loadPartRequests()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
