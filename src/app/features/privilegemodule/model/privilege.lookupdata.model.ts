import {Operation} from '../entity/operation';
import {Role} from '../../usermodule/entity/role';
import {Module} from '../entity/module';

export interface PrivilegeLookUpData {
  roles:Role[];
  operations:Operation[];
  modules: Module[];
}

export const EMPTY_PRIVILEGE_LOOK_UP_DATA: PrivilegeLookUpData = {
  roles: [],
  operations: [],
  modules: [],
};
