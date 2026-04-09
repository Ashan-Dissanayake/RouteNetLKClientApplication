import {Branch} from '../../branchmodule/entity/branch';
import {GrnStatus} from './grnstatus';
import {GrnPartRequestItem} from './grnpartrequestitem';

export class Grn{
  id!:number;
  branch!:Branch;
  number!:string
  doreceived!:string;
  remarks!:string;
  grnstatus!:GrnStatus;
  grnpartrequestitem!:GrnPartRequestItem[];
}
