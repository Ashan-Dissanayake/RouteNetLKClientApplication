import {Branch} from '../../branchmodule/entity/branch';

export class TicketMachine{
  id!:number;
  name!:string;
  branch!:Branch;

  constructor(id: number, name: string, branch: Branch) {
    this.id = id;
    this.name = name;
    this.branch = branch;
  }
}
