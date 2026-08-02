import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Branch} from '../../../branchmodule/entity/branch';
import {IncidentVehicleAllocation} from '../../entity/incidentvehicleallocation';
import {IncidentVehicleAllocationService} from '../api/incidentvehicleallocation.service';
import {Vehicle} from '../../../vehiclemodule/entity/vehicle';
import {
  EMPTY_INCIDENT_VEHICLE_ALLOCATION_METADATA,
  IncidentVehicleAllocationMetadata
} from '../../model/incidentvehicleallocation.metadata.model';
import {IncidentVehicleAllocationMetadataService} from './incidentvehicleallocation.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class IncidentVehicleAllocationFacadeService extends BaseFacade<IncidentVehicleAllocation, IncidentVehicleAllocationMetadata> {

  constructor(
    private allocationService: IncidentVehicleAllocationService,
    private incidentVehicleAllocationMetadataService: IncidentVehicleAllocationMetadataService,
  ) {
    super(
      allocationService,
      incidentVehicleAllocationMetadataService,
      EMPTY_INCIDENT_VEHICLE_ALLOCATION_METADATA
    );
  }

  readonly incidentVehicleAllocations$ = this.items$;


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

  // ===== Metadata helpers =====

  get metadataSnapshot(): IncidentVehicleAllocationMetadata {
    return this.metadataSubject.getValue();
  }

  getBranchesForIncident(incidentId: number): Branch[] {
    const incidents = this.metadataSnapshot.incidents ?? [];
    const branches  = this.metadataSnapshot.branches ?? [];

    const incident = incidents.find(i => i.id === incidentId);

    if (!incident) return [];

    return branches.filter(
      b => b.regionaloffice.id === (incident as any).regionalareaId
    );
  }

  getVehiclesForBranch(branchId: number): Vehicle[] {
    const vehicles = this.metadataSnapshot.vehicles ?? [];
    return vehicles.filter(
      v => (v as any).branchId === branchId
    );
  }
}
