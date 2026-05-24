import {Incident} from '../../incidentreportmodule/entity/incident';
import {Vehicle} from '../../vehiclemodule/entity/vehicle';
import {Branch} from '../../branchmodule/entity/branch';
import {IncidentVehicleAllocationStatus} from './incidentvehicleallocationstatus';

export class IncidentVehicleAllocation{
  id!:number;
  incident!:Incident;
  vehicle!:Vehicle;
  providedbranch!:Branch;
  incidentvehicleallocationstatus!:IncidentVehicleAllocationStatus;
  doassinged!:string;
  doreleased!:string
}
