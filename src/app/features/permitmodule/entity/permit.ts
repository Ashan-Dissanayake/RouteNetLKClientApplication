import {Branch} from '../../branchmodule/entity/branch';
import {PermitStatus} from './permitstatus';
import {ServiceType} from './servicetype';
import {Route} from './route';

export class Permit{
  id!:number;
  name!:string;
  doissued!:string;
  doexpired!:string;
  branch!:Branch;
  permitestatus!:PermitStatus;
  servicetype!:ServiceType;
  route!:Route;
}
