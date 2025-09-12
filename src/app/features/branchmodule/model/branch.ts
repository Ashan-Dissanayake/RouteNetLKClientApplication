import {Branchcoverage} from './branchcoverage';
import {BranchStatus} from './branchstatus';
import {BranchType} from './branchtype';

export class Branch {

  name!: string;
  code!: string;
  address!: string;
  telephone!: string;
  docreated!: Date;
  districts!:Branchcoverage;
  remarks!: string;
  branchtype!: BranchType;
  branchstatus!: BranchStatus;

}


