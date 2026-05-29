import {BranchType} from '../entity/branchtype';
import {BranchStatus} from '../entity/branchstatus';
import {RegionalOffice} from '../entity/regionaloffice';


export interface BranchMetadata{
  branchTypes:BranchType[];
  branchStatuses:BranchStatus[];
  regionalOffices:RegionalOffice[];
  regexes:any;
}

export const EMPTY_BRANCH_METADATA: BranchMetadata = {
  branchTypes: [],
  branchStatuses: [],
  regionalOffices: [],
  regexes: {}
}
