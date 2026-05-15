import {Branch} from '../../branchmodule/entity/branch';
import {TripExecution} from '../../tripexecution/entity/tripexecution';
import {IncidentType} from './incidenttype';
import {RegionalOffice} from '../../branchmodule/entity/regionaloffice';
import {IncidentStatus} from './incidentstatus';

export class Incident{
  id!:number;
  branch!:Branch;
  tripexecution!:TripExecution;
  incidenttype!:IncidentType;
  regionalarea!:RegionalOffice;
  toreported!:string;
  doreported!:string;
  odometeratincident!:number;
  remarks!:string;
  incidentstatus!:IncidentStatus;
}
