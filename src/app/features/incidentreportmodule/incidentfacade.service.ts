import {Injectable} from '@angular/core';
import {BranchService} from '../branchmodule/services/api/branch.service';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {Incident} from './entity/incident';
import {TripExecutionService} from '../tripexecution/service/api/tripexecution.service';
import {IncidentTypeService} from './service/incidenttype.service';
import {IncidentStatusService} from './service/incidentstatus.service';
import {RegionalOfficeService} from '../branchmodule/services/api/regionaloffice.service';
import {IncidentService} from './service/incident.service';
import {Branch} from '../branchmodule/entity/branch';
import {IncidentType} from './entity/incidenttype';
import {IncidentStatus} from './entity/incidentstatus';
import {TripExecution} from '../tripexecution/entity/tripexecution';
import {RegionalOffice} from '../branchmodule/entity/regionaloffice';
import {Trip} from '../tripmodule/entity/trip';

@Injectable({
  providedIn: 'root',
})
export class IncidentFacadeService{

  private incidentSubject = new BehaviorSubject<Incident[]>([]);
  incident$ = this.incidentSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private branchService:BranchService,
    private tripExecutionService:TripExecutionService,
    private incidentTypeService:IncidentTypeService,
    private incidentStatusService:IncidentStatusService,
    private regionalOfficeService:RegionalOfficeService,
    private incidentService:IncidentService
  ) {
  }

  private clearError(): void { this.errorSubject.next(null); }

  initializeIncidentModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      branches:this.loadBranches(),
      incidentTypes:this.loadIncidentTypes(),
      incidentStatuses:this.loadIncidentStatuses(),
      tripExecutions:this.loadTripExecutions(),
      regionalOffices:this.loadRegionalOffices(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshIncidents()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadIncidents(): void { this.refreshIncidents(); }

  loadIncidents(params?:any):Observable<Incident[]>{
    this.loadingSubject.next(true);
    this.clearError();
    return this.incidentService.get(params).pipe(
      map(res=>res.data as Incident[]),
      tap(data=>this.incidentSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(()=>err)}
      )
    );
  }

  filterIncident(criteria: Record<string, any>): void {
    const normalized = normalizeSearchCriteria(criteria);
    this.loadIncidents(normalized)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        error: err => this.errorSubject.next(err)
      });
  }

  createIncident(incidentData: Incident): Observable<Incident> {
    return this.incidentService.save(incidentData);
  }

  inProgress(incident:Incident):Observable<Incident>{
    return this.incidentService.inProgress(incident.id);
  }

  vehicleRecovery(incident:Incident):Observable<Incident>{
    return this.incidentService.vehicleRecovery(incident.id);
  }

  pendingAllocation(incident:Incident):Observable<Incident>{
    return this.incidentService.pendingAllocation(incident.id);
  }

  resolved(incident:Incident):Observable<Incident>{
    return this.incidentService.resolved(incident.id);
  }

  closed(incident:Incident):Observable<Incident>{
    return this.incidentService.closed(incident.id);
  }

  // ===== Metadata Loading =====
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}
  loadIncidentTypes(): Observable<IncidentType[]> { return this.incidentTypeService.get().pipe(map(res => res.data)); }
  loadIncidentStatuses(): Observable<IncidentStatus[]> { return this.incidentStatusService.get().pipe(map(res => res.data)); }
  loadTripExecutions(): Observable<TripExecution[]> { return this.tripExecutionService.getSummary().pipe(map(res => res.data)); }
  loadRegionalOffices(): Observable<RegionalOffice[]> { return this.regionalOfficeService.get().pipe(map(res => res.data)); }

  private refreshIncidents(): void {
    this.loadIncidents()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
