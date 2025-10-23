import {Gender} from './gender';
import {Employeestatus} from './employeestatus';
import {Employeetype} from './employeetype';
import {Designation} from './designation';
import {Branch} from '../../branchmodule/model/branch';

export class Department{

  id!:number;
  number!: string;
  fullname!:string;
  nic!:string;
  gender!:Gender;
  mobile!:string;
  email!:string;
  address!:string;
  emergencycontact!:string;
  image!:string;
  branch!:Branch;
  doj!:string;
  department!:Department;
  designation!:Designation;
  employeetype!:Employeetype;
  employeestatus!:Employeestatus;

}
