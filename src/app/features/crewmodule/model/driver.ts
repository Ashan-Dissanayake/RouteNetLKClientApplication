import {Employee} from '../../employeemodule/model/employee';
import {Licensecategory} from './licensecategory';
import {Crewstatus} from './crewstatus';
import {Allowedbustype} from './allowedbustype';
import {Routefamiliaritylevel} from './routefamiliaritylevel';

export class Driver{
  id!:number;
  employee!:Employee;
  number!:string;
  dolicenseexpired!:string;
  domedicalexpired!:string;
  licensecategory!:Licensecategory;
  crewstatus!:Crewstatus;
  routefamiliaritylevel!:Routefamiliaritylevel;
  allowedbustype!:Allowedbustype
}
