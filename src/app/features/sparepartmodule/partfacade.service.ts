import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {Part} from './entity/part';
import {PartService} from './service/part.service';
import {PartMasterService} from './service/partmaster.service';
import {RegexService} from '../../core/regex.service';
import {PartStatusService} from './service/partstatus.service';
import {PartStatus} from './entity/partstatus';
import {catchError, map} from 'rxjs/operators';
import {Regex} from '../../shared/models/regex.model';
import {Branch} from '../branchmodule/entity/branch';
import {BranchService} from '../branchmodule/services/branch.service';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {PartMaster} from './entity/partmaster';

@Injectable({
  providedIn: 'root',
})
export class PartFacadeService {

  private partsSubject = new BehaviorSubject<Part[]>([]);
  parts$ = this.partsSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private partService:PartService,
    private partMasterService:PartMasterService,
    private partStatusService:PartStatusService,
    private branchService:BranchService,
    private regexService: RegexService,
  ) {}

  private clearError(): void { this.errorSubject.next(null); }

  initializePartModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      partStatuses:this.loadPartStatuses(),
      partMasters:this.loadPartMasters(),
      branches:this.loadBranches(),
      regexes: this.loadStaticRegexes(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshParts()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadParts(): void { this.refreshParts(); }

  loadParts(params?:any):Observable<Part[]>{
      this.loadingSubject.next(true);
      this.clearError();
      return this.partService.get(params).pipe(
        map(res=>res.data as Part[]),
        tap(data=>this.partsSubject.next(data)),
        catchError(err => {
          this.errorSubject.next(err);
          return throwError(()=>err)}
        )
      );
  }

  filterParts(criteria: Record<string, any>): void {
    const normalized = normalizeSearchCriteria(criteria);
    this.loadParts(normalized)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        error: err => this.errorSubject.next(err)
      });
  }

  createPart(partData: Part): Observable<Part> {
      return this.partService.save(partData);
  }

  updatePart(partData: Part): Observable<Part> {
    return this.partService.update(partData);
  }

  deactivateParts(parts: Part[]): Observable<number[]> {
    if (!parts || parts.length === 0) return throwError(() => new Error('No vehicle selected'));
    const ids = parts
      .map(p => p.id!)
      .filter(id => id != null);
    return this.partService.deactivate(ids);
  }

  // ===== Metadata Loading =====
  loadPartStatuses(): Observable<PartStatus[]> { return this.partStatusService.get().pipe(map(res => res.data)); }
  loadPartMasters(): Observable<PartMaster[]> { return this.partMasterService.get().pipe(map(res => res.data)); }
  loadStaticRegexes(): Observable<Regex> { return this.regexService.getStaticRegexes('parts').pipe(map(res => res.data)); }
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}

  // ===== Private Helpers =====
  private refreshParts(): void {
    this.loadParts()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
