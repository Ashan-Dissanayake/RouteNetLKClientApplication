import {Branchcoverage} from './branchcoverage';
import {BranchStatus} from './branchstatus';
import {BranchType} from './branchtype';

export class Branch {

  name!: string;
  code!: string;
  address!: string;
  telephone!: string;
  docreated!: Date;
  remarks!: string;
  branchtype!: BranchType;
  branchstatus!: BranchStatus;
  districts!:Branchcoverage;

}


