import {Branch} from '../../branchmodule/entity/branch';
import {IncidentStatus} from '../entity/incidentstatus';
import {IncidentType} from '../entity/incidenttype';
import {TripExecution} from '../../tripexecution/entity/tripexecution';
import {RegionalOffice} from '../../branchmodule/entity/regionaloffice';

export interface IncidentMetadata {
  branches:        Branch[];
  incidentTypes:   IncidentType[];
  incidentStatuses: IncidentStatus[];
  tripExecutions:  TripExecution[];
  regionalOffices: RegionalOffice[];
}

export const EMPTY_INCIDENT_METADATA: IncidentMetadata = {
  branches:         [],
  incidentTypes:    [],
  incidentStatuses: [],
  tripExecutions:   [],
  regionalOffices:  [],
};
