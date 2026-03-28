import {Employee} from '../../employeemodule/entity/employee';
import {AllowedBusType} from './allowedbustype';
import {RouteFamiliarityLevel} from './routefamiliaritylevel';
import {CrewStatus} from './crewstatus';
import {LicenseCategory} from './licensecategory';


export class Conductor{
  id!:number;
  employee!:Employee;
  number!:string;
  domedicalexpired!:string;
  domedicalissued!:string;
  crewstatus!:CrewStatus;
  routefamiliaritylevel!:RouteFamiliarityLevel;
  allowedbustype!:AllowedBusType
}
