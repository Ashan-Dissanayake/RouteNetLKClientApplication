import {Employee} from '../../employeemodule/model/employee';
import {AllowedBusType} from './allowedbustype';
import {RouteFamiliarityLevel} from './routefamiliaritylevel';
import {CrewStatus} from './crewstatus';
import {LicenseCategory} from './licensecategory';


export class Driver{
  id!:number;
  employee!:Employee;
  number!:string;
  dolicenseexpired!:string;
  domedicalexpired!:string;
  licensecategory!:LicenseCategory;
  crewstatus!:CrewStatus;
  routefamiliaritylevel!:RouteFamiliarityLevel;
  allowedbustype!:AllowedBusType
}
