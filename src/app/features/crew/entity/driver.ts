import {Employee} from '../../employeemodule/entity/employee';
import {AllowedBusType} from './allowedbustype';
import {RouteFamiliarityLevel} from './routefamiliaritylevel';
import {CrewStatus} from './crewstatus';
import {LicenseCategory} from './licensecategory';


export class Driver{
  id!:number;
  employee!:Employee;
  number!:string;
  licensenumber!:string;
  dolicenseissued!:string;
  dolicenseexpired!:string;
  domedicalexpired!:string;
  domedicalissued!:string;
  licensecategory!:LicenseCategory;
  crewstatus!:CrewStatus;
  routefamiliaritylevel!:RouteFamiliarityLevel;
  allowedbustype!:AllowedBusType
}
