import {Vehiclestatus} from '../entity/vehiclestatus';
import {Make} from '../entity/make';
import {Model} from '../entity/model';
import {Fueltype} from '../entity/fueltype';
import {Bustype} from '../entity/bustype';
import {Conditionrate} from '../entity/conditionrate';
import {Branch} from '../../branchmodule/entity/branch';


export interface VehicleMetadata {
  vehicleStatuses: Vehiclestatus[];
  makes:Make[];
  models:Model[];
  fuelTypes:Fueltype[];
  busTypes:Bustype[];
  conditionRates:Conditionrate[];
  branches:Branch[];
  regexRules:any;
}

export const EMPTY_VEHICLE_METADATA: VehicleMetadata = {
  vehicleStatuses: [],
  makes:[],
  models:[],
  fuelTypes:[],
  busTypes:[],
  conditionRates:[],
  branches:[],
  regexRules:{},
};
