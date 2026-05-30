import {Employee} from '../../employeemodule/entity/employee';
import {LicenseCategory} from '../entity/licensecategory';
import {CrewStatus} from '../entity/crewstatus';
import {RouteFamiliarityLevel} from '../entity/routefamiliaritylevel';

export interface DriverMetadata{
  employees:Employee[];
  licenceCategories:LicenseCategory[];
  crewStatuses:CrewStatus[];
  routeFamiliarityLevels:RouteFamiliarityLevel[];
  regexes:any;
}

export const EMPTY_DRIVER_METADATA: DriverMetadata = {
  employees: [],
  licenceCategories: [],
  crewStatuses: [],
  routeFamiliarityLevels: [],
  regexes: {}
}
