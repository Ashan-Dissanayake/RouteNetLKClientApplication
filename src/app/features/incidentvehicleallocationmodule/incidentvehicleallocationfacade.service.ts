import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {Branch} from '../branchmodule/entity/branch';
import {IncidentVehicleAllocation} from './entity/incidentvehicleallocation';
import {IncidentVehicleAllocationStatusService} from './service/incidenvehicleallocationtstatus.service';
import {IncidentVehicleAllocationService} from './service/incidentvehicleallocation.service';
import {VehicleService} from '../vehiclemodule/service/vehicle.service';
import {BranchService} from '../branchmodule/services/branch.service';
import {IncidentService} from '../incidentreportmodule/service/incident.service';
import {IncidentVehicleAllocationStatus} from './entity/incidentvehicleallocationstatus';
import {Incident} from '../incidentreportmodule/entity/incident';
import {Vehicle} from '../vehiclemodule/entity/vehicle';

@Injectable({
  providedIn: 'root',
})
export class IncidentVehicleAllocationFacadeService{

  private incidentVehicleAllocationSubject = new BehaviorSubject<IncidentVehicleAllocation[]>([]);
  incidentVehicleAllocations$ = this.incidentVehicleAllocationSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private incidentVehicleAllocationStatusService:IncidentVehicleAllocationStatusService,
    private incidentVehicleAllocationService:IncidentVehicleAllocationService,
    private incidentService:IncidentService,
    private vehicleService:VehicleService,
    private branchService:BranchService,
  ) {
  }

  private clearError(): void { this.errorSubject.next(null); }

  initializeIncidentVehicleAllocationModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      incidentVehicleAllocationStatuses:this.loadIncidentVehicleAllocationStatuses(),
      incidents:this.loadIncidents(),
      vehicles:this.loadVehicles(),
      branches:this.loadBranches(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshIncidentVehicleAllocations()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadIncidentVehicleAllocations(): void { this.refreshIncidentVehicleAllocations(); }

  loadIncidentVehicleAllocations(params?:any):Observable<IncidentVehicleAllocation[]>{
    this.loadingSubject.next(true);
    this.clearError();
    return this.incidentVehicleAllocationService.get(params).pipe(
      map(res=>res.data as IncidentVehicleAllocation[]),
      tap(data=>this.incidentVehicleAllocationSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(()=>err)}
      )
    );
  }

  filterIncidentVehicleAllocations(criteria: Record<string, any>): void {
    const normalized = normalizeSearchCriteria(criteria);
    this.loadIncidentVehicleAllocations(normalized)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        error: err => this.errorSubject.next(err)
      });
  }

  createIncidentVehicleAllocation(incidentVehicleAllocationData: IncidentVehicleAllocation): Observable<IncidentVehicleAllocation> {
    return this.incidentVehicleAllocationService.save(incidentVehicleAllocationData);
  }

  inProgress(incidentVehicleAllocation:IncidentVehicleAllocation):Observable<IncidentVehicleAllocation>{
    return this.incidentVehicleAllocationService.inProgress(incidentVehicleAllocation.id);
  }

  pendingAllocation(incidentVehicleAllocation:IncidentVehicleAllocation):Observable<IncidentVehicleAllocation>{
    return this.incidentVehicleAllocationService.pendingAllocation(incidentVehicleAllocation.id);
  }

  released(incidentVehicleAllocation:IncidentVehicleAllocation):Observable<IncidentVehicleAllocation>{
    return this.incidentVehicleAllocationService.released(incidentVehicleAllocation.id);
  }

  // ===== Metadata Loading =====
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}
  loadIncidentVehicleAllocationStatuses(): Observable<IncidentVehicleAllocationStatus[]> { return this.incidentVehicleAllocationStatusService.get().pipe(map(res => res.data)); }
  loadIncidents(): Observable<Incident[]> { return this.incidentService.getSummary().pipe(map(res => res.data)); }
  loadVehicles(): Observable<Vehicle[]> { return this.vehicleService.getSummary().pipe(map(res => res.data)); }


  get metadataSnapshot(): any {
    return this.metadataSubject.getValue();
  }

  getBranchesForIncident(incidentId: number): Branch[] {
    const incidents: any[] = this.metadataSnapshot.incidents ?? [];
    const branches: any[] = this.metadataSnapshot.branches ?? [];

    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) return [];

    return  branches.filter(b => b.regionalOfficeId === incident.regionalareaId);
  }

  getVehiclesForBranch(branchId: number): Vehicle[] {
    const vehicles: any[] = this.metadataSnapshot.vehicles ?? [];
    console.log(vehicles)
    return vehicles.filter(v => v.branchId === branchId);
  }

  private refreshIncidentVehicleAllocations(): void {
    this.loadIncidentVehicleAllocations()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
