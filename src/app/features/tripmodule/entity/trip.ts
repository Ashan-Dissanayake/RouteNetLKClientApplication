import {TripType} from './triptype';
import {Permit} from '../../permitmodule/entity/permit';
import {Branch} from '../../branchmodule/entity/branch';
import {TripStatus} from './tripstatus';
import {OriginTerminal} from './originterminal';

export class Trip{
  id!: number;
  branch!:Branch;
  triptype!:TripType;
  permite!:Permit;
  doservice!:string;
  todepature!:string;
  toarrival!:string;
  remarks!:string;
  notrip!:number;
  tripstatus!:TripStatus;
  originterminal!:OriginTerminal;
}
