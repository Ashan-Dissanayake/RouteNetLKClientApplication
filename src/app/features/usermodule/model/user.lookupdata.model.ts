import {Branch} from '../../branchmodule/entity/branch';
import {UserType} from '../entity/usertype';
import {UserStatus} from '../entity/userstatus';
import {Employee} from '../../employeemodule/entity/employee';
import {Role} from '../entity/role';

export interface UserLookUpData {
  employees:Employee[];
  userTypes:UserType[];
  userStatuses: UserStatus[];
  roles: Role[];
  regexes:any;
}

export const EMPTY_USER_LOOK_UP_DATA: UserLookUpData = {
  employees: [],
  userTypes: [],
  userStatuses: [],
  roles: [],
  regexes: {}
};
