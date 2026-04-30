import {Branch} from '../../branchmodule/entity/branch';

export class Roster {
  id!:number;
  branch!:Branch;
  dostartofweek!:string;
  doendofweek!:string;
}
