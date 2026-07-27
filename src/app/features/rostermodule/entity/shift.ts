import {ShiftStatus} from './shiftstatus';

export class Shift{
  id!:number;
  name!:string;
  tostart!:string;
  toend!:string;
  shiftstatus!:ShiftStatus;
  shiftFullName!:string;

  constructor(id: number, name: string, tostart: string, toend: string, shiftstatus: ShiftStatus,shiftFullName:string) {
    this.id = id;
    this.name = name;
    this.tostart = tostart;
    this.toend = toend;
    this.shiftstatus = shiftstatus;
    this.shiftFullName = shiftFullName;
  }
}
