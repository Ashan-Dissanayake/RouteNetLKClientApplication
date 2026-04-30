import {Roster} from './roster';
import {Shift} from './shift';
import {Designation} from '../../employeemodule/entity/designation';

export class RosterShift{
  roster!:Roster;
  shift!:Shift;
  doshift!:string;
  designation!:Designation;
  requiredemployeecount!:number;

  constructor(roster: Roster, shift: Shift, doshift: string, designation: Designation, requiredemployeecount: number) {
    this.roster = roster;
    this.shift = shift;
    this.doshift = doshift;
    this.designation = designation;
    this.requiredemployeecount = requiredemployeecount;
  }
}
