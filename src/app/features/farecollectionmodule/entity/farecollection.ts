import {TripExecution} from '../../tripexecution/entity/tripexecution';
import {Branch} from '../../branchmodule/entity/branch';
import {TicketMachine} from './ticketmachine';

export class FareCollection{
  id!:number;
  branch!:Branch;
  tripexecution!:TripExecution;
  ticketmachine!:TicketMachine;
  totaltickets!:number;
  cachecollected!:number;
  digitalpayments!:number;
  isreconciled!:boolean;
  tocollected!:string;
}
