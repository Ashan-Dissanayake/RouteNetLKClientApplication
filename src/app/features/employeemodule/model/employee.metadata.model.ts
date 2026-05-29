import {EmployeeType} from '../entity/employeetype';
import {EmployeeStatus} from '../entity/employeestatus';
import {Designation} from '../entity/designation';
import {Gender} from '../entity/gender';
import {Department} from '../entity/department';
import {Branch} from '../../branchmodule/entity/branch';

export interface EmployeeMetadata{
  employeeTypes:EmployeeType[];
  employeeStatuses:EmployeeStatus[];
  designations:Designation[];
  departments:Department[];
  genders:Gender[];
  branches:Branch[];
  regexes:any;
}

export const EMPTY_EMPLOYEE_METADATA: EmployeeMetadata = {
  employeeTypes: [],
  employeeStatuses: [],
  designations: [],
  departments: [],
  genders: [],
  branches: [],
  regexes: {}
}
