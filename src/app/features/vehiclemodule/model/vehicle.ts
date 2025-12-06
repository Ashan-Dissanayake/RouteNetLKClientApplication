import {Make} from './make';
import {Fueltype} from './fueltype';
import {Conditionrate} from './conditionrate';
import {Servicetype} from './servicetype';
import {Vehiclestatus} from './vehiclestatus';
import {Branch} from '../../branchmodule/model/branch';
import {Employee} from '../../employeemodule/model/employee';

export class Vehicle{
  id!:number;
  make!:Make;
  code!:string;
  number!:string;
  seatingcapacity!:number;
  yom!:string;
  dob!:string;
  mileage!:number;
  chassisnumber!:string;
  enginenumber!:string;
  fueltype!:Fueltype;
  conditionrate!:Conditionrate;
  remarks!:string;
  servicetype!:Servicetype;
  vehiclestatus!:Vehiclestatus;
  employee!:Employee;
  branch!:Branch;
}
