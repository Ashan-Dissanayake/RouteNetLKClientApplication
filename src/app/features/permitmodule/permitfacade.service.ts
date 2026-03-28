import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, tap, throwError} from 'rxjs';
import {Permit} from './entity/permit';
import {PermitStatus} from './entity/permitstatus';
import {ServiceType} from './entity/servicetype';
import {Route} from './entity/route';
import {PermitService} from './service/permit.service';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {RouteService} from './service/route.service';
import {PermitStatusService} from './service/permitstatus.service';
import {RegexService} from '../../core/regex.service';
import {Regex} from '../../shared/models/regex.model';
import {ServiceTypeService} from './service/servicetype.service';
import {BranchService} from '../branchmodule/services/branch.service';
import {VehicleService} from '../vehiclemodule/service/vehicle.service';
import {Vehicle} from '../vehiclemodule/entity/vehicle';
import {Branch} from '../branchmodule/entity/branch';

@Injectable({
  providedIn: 'root',
})
export class PermitFacadeService {

  private permitsSubject = new BehaviorSubject<Permit[]>([]);
  permits$ = this.permitsSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private permitService:PermitService,
    private routeService:RouteService,
    private permitStatusService:PermitStatusService,
    private serviceTypeService:ServiceTypeService,
    private branchService:BranchService,
    private vehicleService:VehicleService,
    private regexService: RegexService,
  ) {}

  private clearError(): void { this.errorSubject.next(null); }

  initializePermitModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      permitStatuses:this.loadPermitStatuses(),
      serviceTypes:this.loadServiceTypes(),
      routes:this.loadRoutes(),
      vehicles:this.loadVehicles(),
      branches:this.loadBranches(),
      regexes: this.loadStaticRegexes(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshPermits()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadPermits(): void { this.refreshPermits(); }

  loadPermits(params?:any):Observable<Permit[]>{
      this.loadingSubject.next(true);
      this.clearError();

      return this.permitService.get(params).pipe(
        map(res=>res.data as Permit[]),
        tap(data=>this.permitsSubject.next(data)),
        catchError(err => {
          this.errorSubject.next(err);
          return throwError(()=>err)}
        )
      );
  }

  filterPermits(criteria: Record<string, any>): void {
    const normalized = normalizeSearchCriteria(criteria);
    this.loadPermits(normalized)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        error: err => this.errorSubject.next(err)
      });
  }

  createPermit(permitData: Permit): Observable<Permit> {
      return this.permitService.save(permitData);
  }

  transferPermit(permitId:number): Observable<Permit>{
    return this.permitService.transferPermit(permitId);
  }

  // ===== Metadata Loading =====
  loadPermitStatuses(): Observable<PermitStatus[]> { return this.permitStatusService.get().pipe(map(res => res.data)); }
  loadServiceTypes(): Observable<ServiceType[]> { return this.serviceTypeService.get().pipe(map(res => res.data)); }
  loadRoutes(): Observable<Route[]> { return this.routeService.get().pipe(map(res => res.data)); }
  loadStaticRegexes(): Observable<Regex> { return this.regexService.getStaticRegexes('permits').pipe(map(res => res.data)); }
  loadVehicles(): Observable<Vehicle[]> {return this.vehicleService.getSummary().pipe(map(res => res.data));}
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}

  // ===== Private Helpers =====
  private refreshPermits(): void {
    this.loadPermits()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
