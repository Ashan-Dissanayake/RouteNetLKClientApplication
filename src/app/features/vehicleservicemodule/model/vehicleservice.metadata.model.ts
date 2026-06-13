import {Branch} from '../../branchmodule/entity/branch';
import {VehicleServiceStatus} from '../entity/vehicleservicestatus';
import {VehicleServiceType} from '../entity/vehicleservicetype';
import {VehicleServicePriority} from '../entity/vehicleservicepriority';
import {Incident} from '../../incidentreportmodule/entity/incident';
import {Vehicle} from '../../vehiclemodule/entity/vehicle';
import {Part} from '../../sparepartmodule/entity/part';


export interface VehicleServiceMetadata {
  vehicleServiceStatuses: VehicleServiceStatus[];
  vehicleServiceTypes: VehicleServiceType[];
  vehicleServicePriorities: VehicleServicePriority[];
  incidents: Incident[];
  vehicles: Vehicle[];
  branches:Branch[];
  parts:        Part[];
}

export const EMPTY_VEHICLE_SERVICE_METADATA: VehicleServiceMetadata = {
  vehicleServiceStatuses: [],
  vehicleServiceTypes: [],
  vehicleServicePriorities: [],
  incidents: [],
  vehicles: [],
  branches:[],
  parts: []
};
