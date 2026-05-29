import {Gender} from './gender';
import {EmployeeStatus} from './employeestatus';
import {EmployeeType} from './employeetype';
import {Designation} from './designation';
import {Branch} from '../../branchmodule/entity/branch';
import {Department} from './department';

export class Employee{

  id!:number;
  number!: string;
  fullname!:string;
  callingname!:string;
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
  employeetype!:EmployeeType;
  employeestatus!:EmployeeStatus;

}
