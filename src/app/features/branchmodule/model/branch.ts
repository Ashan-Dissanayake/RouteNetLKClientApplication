import {BranchStatus} from './branchstatus';
import {RegionalOffice} from './regionaloffice';

export class Branch {

  id!:number;
  name!: string;
  code!: string;
  address!: string;
  telephone!: string;
  docreated!: string;
  email!:string
  remarks!: string;
  branchstatus!: BranchStatus;
  regionaloffice!: RegionalOffice;

}


