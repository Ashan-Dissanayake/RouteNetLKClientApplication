import {Employee} from '../../employeemodule/entity/employee';
import {LicenseCategory} from '../entity/licensecategory';
import {CrewStatus} from '../entity/crewstatus';
import {RouteFamiliarityLevel} from '../entity/routefamiliaritylevel';

export interface ConductorMetadata{
  employees:Employee[];
  crewStatuses:CrewStatus[];
  routeFamiliarityLevels:RouteFamiliarityLevel[];
  regexes:any;
}

export const EMPTY_CONDUCTOR_METADATA: ConductorMetadata = {
  employees: [],
  crewStatuses: [],
  routeFamiliarityLevels: [],
  regexes: {}
}
