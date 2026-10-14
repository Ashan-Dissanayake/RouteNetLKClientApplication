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
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class IncidentVehicleAllocationFacadeService extends BaseFacade<IncidentVehicleAllocation, IncidentVehicleAllocationMetadata> {

  constructor(
    private allocationService: IncidentVehicleAllocationService,
    metadataService: IncidentVehicleAllocationMetadataService,
  ) {
    super(
      allocationService,
      metadataService,
      EMPTY_INCIDENT_VEHICLE_ALLOCATION_METADATA
    );
  }

  // ===== Domain-specific status transitions =====

  inProgress(
    allocation: IncidentVehicleAllocation
  ): Observable<IncidentVehicleAllocation> {

    return this.allocationService.inProgress(
      allocation.id
    );
  }

  pendingAllocation(
    allocation: IncidentVehicleAllocation
  ): Observable<IncidentVehicleAllocation> {

    return this.allocationService.pendingAllocation(
      allocation.id
    );
  }

  released(
    allocation: IncidentVehicleAllocation
  ): Observable<IncidentVehicleAllocation> {

    return this.allocationService.released(
      allocation.id
    );
  }

  // ===== Metadata-dependent lookup helpers =====

  private get metadataSnapshot(): IncidentVehicleAllocationMetadata {
    return this.metadataSubject.getValue();
  }

  getBranchesForIncident(
    incidentId: number
  ): Branch[] {

    const metadata = this.metadataSnapshot;

    const incidents = metadata.incidents ?? [];
    const branches = metadata.branches ?? [];

    const incident =
      incidents.find(item => item.id === incidentId);

    if (!incident) {
      return [];
    }

    return branches.filter(
      branch =>
        branch.regionaloffice.id ===
        (incident as any).regionalareaId
    );
  }

  getVehiclesForBranch(
    branchId: number
  ): Vehicle[] {

    const vehicles =
      this.metadataSnapshot.vehicles ?? [];

    return vehicles.filter(
      vehicle =>
        (vehicle as any).branchId === branchId
    );
  }
}
