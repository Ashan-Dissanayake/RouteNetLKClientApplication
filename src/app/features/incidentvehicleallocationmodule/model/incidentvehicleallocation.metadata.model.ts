import {Branch} from '../../branchmodule/entity/branch';
import {Incident} from '../../incidentreportmodule/entity/incident';
import {Vehicle} from '../../vehiclemodule/entity/vehicle';
import {IncidentVehicleAllocationStatus} from '../entity/incidentvehicleallocationstatus';

export interface IncidentVehicleAllocationMetadata {
  incidents:Incident[];
  vehicles:Vehicle[];
  branches:Branch[];
  incidentVehicleAllocationStatuses: IncidentVehicleAllocationStatus[];
}

export const EMPTY_INCIDENT_VEHICLE_ALLOCATION_METADATA: IncidentVehicleAllocationMetadata = {
  incidents:[],
  vehicles:[],
  branches:[],
  incidentVehicleAllocationStatuses: [],
};
