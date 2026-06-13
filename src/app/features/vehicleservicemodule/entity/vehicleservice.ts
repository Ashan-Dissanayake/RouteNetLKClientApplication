import {Branch} from '../../branchmodule/entity/branch';
import {Vehicle} from '../../vehiclemodule/entity/vehicle';
import {VehicleServiceType} from './vehicleservicetype';
import {VehicleServiceStatus} from './vehicleservicestatus';
import {VehicleServicePriority} from './vehicleservicepriority';
import {Incident} from '../../incidentreportmodule/entity/incident';
import {VehicleServicePart} from './vehicleservicepart';

export class VehicleService{
  id!:number;
  branch!:Branch;
  number!:string;
  vehicle!:Vehicle;
  vehicleservicetype!:VehicleServiceType;
  vehicleservicestatus!:VehicleServiceStatus;
  vehicleservicepriority!:VehicleServicePriority;
  incident!:Incident;
  docreated!:string;
  vehicleservicepart!:VehicleServicePart[];
}
