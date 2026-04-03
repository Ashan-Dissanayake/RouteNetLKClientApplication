import {Branch} from '../../branchmodule/entity/branch';
import {PartRequestStatus} from './partrequeststatus';
import {PartRequestItem} from './partrequestitem';

export class PartRequest{
  id!:number;
  branch!:Branch;
  number!:string
  dorequested!:string;
  remarks!:string;
  partrequeststatus!:PartRequestStatus;
  partrequestitem!:PartRequestItem[];

}
