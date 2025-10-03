import {Branchcoverage} from './branchcoverage';
import {BranchStatus} from './branchstatus';
import {BranchType} from './branchtype';
import {District} from './district';

export class Branch {

  id!:number;
  name!: string;
  code!: string;
  address!: string;
  telephone!: string;
  docreated!: string;
  email!:string
  remarks!: string;
  branchtype: BranchType | undefined;
  branchstatus!: BranchStatus;
  branchcoverages!:Branchcoverage[];

}


