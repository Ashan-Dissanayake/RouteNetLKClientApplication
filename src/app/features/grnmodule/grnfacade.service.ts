import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Branch} from '../branchmodule/entity/branch';
import {BranchService} from '../branchmodule/services/api/branch.service';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {Grn} from './entity/grn';
import {GrnStatus} from './entity/grnstatus';
import {GrnService} from './service/grn.service';
import {GrnStatusService} from './service/grnstatus.service';
import {PartRequestService} from '../partrequestmodule/service/partrequest.service';
import {PartRequest} from '../partrequestmodule/entity/partrequest';

@Injectable({
  providedIn: 'root',
})
export class GrnFacadeService {

  private grnsSubject = new BehaviorSubject<Grn[]>([]);
  grns$ = this.grnsSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private grnService:GrnService,
    private grnStatusService:GrnStatusService,
    private branchService:BranchService,
    private partRequestService:PartRequestService,
  ) {}

  private clearError(): void { this.errorSubject.next(null); }

  initializeGrnModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      grnStatuses:this.loadGrnStatuses(),
      partRequests:this.loadPartRequests(),
      branches:this.loadBranches(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshGrns()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadGrns(): void { this.refreshGrns(); }

  loadGrns(params?:any):Observable<Grn[]>{
      this.loadingSubject.next(true);
      this.clearError();
      return this.grnService.get(params).pipe(
        map(res=>res.data as Grn[]),
        tap(data=>this.grnsSubject.next(data)),
        catchError(err => {
          this.errorSubject.next(err);
          return throwError(()=>err)}
        )
      );
  }

  filterGrns(criteria: Record<string, any>): void {
    const normalized = normalizeSearchCriteria(criteria);
    this.loadGrns(normalized)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        error: err => this.errorSubject.next(err)
      });
  }

  updateGrn(grnData: Grn): Observable<Grn> {
      return this.grnService.update(grnData);
  }


  // ===== Metadata Loading =====
  loadGrnStatuses(): Observable<GrnStatus[]> { return this.grnStatusService.get().pipe(map(res => res.data)); }
  loadPartRequests(): Observable<PartRequest[]> { return this.partRequestService.getSummary().pipe(map(res => res.data)); }
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}

  // ===== Private Helpers =====
  private refreshGrns(): void {
    this.loadGrns()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
