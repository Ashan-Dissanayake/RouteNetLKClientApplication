import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {Branch} from '../../../branchmodule/entity/branch';
import {IncidentVehicleAllocation} from '../../entity/incidentvehicleallocation';
import {IncidentVehicleAllocationService} from '../api/incidentvehicleallocation.service';
import {Incident} from '../../../incidentreportmodule/entity/incident';
import {Vehicle} from '../../../vehiclemodule/entity/vehicle';
import {
  EMPTY_INCIDENT_VEHICLE_ALLOCATION_METADATA,
  IncidentVehicleAllocationMetadata
} from '../../model/incidentvehicleallocation.metadata.model';
import {IncidentVehicleAllocationMetadataService} from './incidentvehicleallocation.metadata.service';

@Injectable()
export class IncidentVehicleAllocationFacadeService implements OnDestroy {

  // ===== State =====
  private allocationSubject = new BehaviorSubject<IncidentVehicleAllocation[]>([]);
  private metadataSubject   = new BehaviorSubject<IncidentVehicleAllocationMetadata>(
    EMPTY_INCIDENT_VEHICLE_ALLOCATION_METADATA
  );
  private loadingSubject    = new BehaviorSubject<boolean>(false);
  private errorSubject      = new BehaviorSubject<any>(null);
  private destroy$          = new Subject<void>();

  // ===== Public streams =====
  readonly incidentVehicleAllocations$ = this.allocationSubject.asObservable();
  readonly metadata$                   = this.metadataSubject.asObservable();
  readonly loading$                    = this.loadingSubject.asObservable();
  readonly error$                      = this.errorSubject.asObservable();

  constructor(
    private allocationService: IncidentVehicleAllocationService,
    private metadataService:   IncidentVehicleAllocationMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<IncidentVehicleAllocationMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchAllocations()),
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
    this.fetchAllocations();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchAllocations(params);
  }

  // ===== CRUD =====

  create(data: IncidentVehicleAllocation): Observable<IncidentVehicleAllocation> {
    return this.allocationService.save(data);
  }

  // ===== Status transitions =====

  inProgress(row: IncidentVehicleAllocation): Observable<IncidentVehicleAllocation> {
    return this.allocationService.inProgress(row.id);
  }

  pendingAllocation(row: IncidentVehicleAllocation): Observable<IncidentVehicleAllocation> {
    return this.allocationService.pendingAllocation(row.id);
  }

  released(row: IncidentVehicleAllocation): Observable<IncidentVehicleAllocation> {
    return this.allocationService.released(row.id);
  }

  // ===== Cascade filter helpers =====
  //
  // These read from the in-memory metadata snapshot — no API call.
  // Used by IncidentVehicleAllocationFormService to wire cascade dropdowns.
  // Live in the facade because they are domain-level computations on
  // domain data (incident → regional area → branch relationship).

  get metadataSnapshot(): IncidentVehicleAllocationMetadata {
    return this.metadataSubject.getValue();
  }

  getBranchesForIncident(incidentId: number): Branch[] {
    const incidents: Incident[] = this.metadataSnapshot.incidents ?? [];
    const branches:  any[]   = this.metadataSnapshot.branches  ?? [];

    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) return [];

    return branches.filter(b => b.regionalOfficeId === (incident as any).regionalareaId);
  }

  getVehiclesForBranch(branchId: number): Vehicle[] {
    const vehicles: Vehicle[] = this.metadataSnapshot.vehicles ?? [];
    return vehicles.filter(v => (v as any).branchId === branchId);
  }

  // ===== Internal helpers =====

  private fetchAllocations(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.allocationService.get(params).pipe(
      map(res => res.data as IncidentVehicleAllocation[]),
      tap(data => this.allocationSubject.next(data)),
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
