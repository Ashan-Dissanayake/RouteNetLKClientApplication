import {Fueltype} from './fueltype';
import {Conditionrate} from './conditionrate';
import {Vehiclestatus} from './vehiclestatus';
import {Branch} from '../../branchmodule/model/branch';
import {Model} from './model';
import {Bustype} from './bustype';

export class Vehicle{
  id!:number;
  branch!:Branch;
  number!:string;
  model!:Model;
  bustype!:Bustype;
  mileage!:number;
  fueltype!:Fueltype;
  conditionrate!:Conditionrate;
  vehiclestatus!:Vehiclestatus;
  remarks!:string;
}
