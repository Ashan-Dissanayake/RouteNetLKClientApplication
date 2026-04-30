import {ShiftStatus} from './shiftstatus';

export class Shift{
  id!:number;
  name!:string;
  tostart!:string;
  toend!:string;
  shiftstatus!:ShiftStatus;

  constructor(id: number, name: string, tostart: string, toend: string, shiftstatus: ShiftStatus) {
    this.id = id;
    this.name = name;
    this.tostart = tostart;
    this.toend = toend;
    this.shiftstatus = shiftstatus;
  }
}
