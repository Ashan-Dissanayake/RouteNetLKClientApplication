import {Fueltype} from './fueltype';
import {Conditionrate} from './conditionrate';
import {Servicetype} from './servicetype';
import {Vehiclestatus} from './vehiclestatus';
import {Branch} from '../../branchmodule/model/branch';
import {Employee} from '../../employeemodule/model/employee';
import {Seatingcapacity} from './seatingcapacity';

export class Vehicle{
  id!:number;
  code!:string;
  number!:string;
  seatingcapacity!:Seatingcapacity;
  yom!:string;
  dob!:string;
  mileage!:number;
  chasisnumber!:string;
  enginenumber!:string;
  fueltype!:Fueltype;
  conditionrate!:Conditionrate;
  remarks!:string;
  servicetype!:Servicetype;
  vehiclestatus!:Vehiclestatus;
  employee!:Employee;
  branch!:Branch;
}
