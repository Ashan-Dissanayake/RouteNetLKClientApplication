import {Role} from '../../usermodule/entity/role';
import {Module} from './module';
import {Operation} from './operation';

export class Privilege{
  id!:number;
  authority!:string;
  role!:Role;
  module!:Module;
  operation!:Operation;
}
