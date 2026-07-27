import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RegexService} from '../../../../core/regex.service';
import {EmployeeService} from '../../../employeemodule/services/api/employee.service';
import {LicenseCategoryService} from '../api/licensecategory.service';
import {CrewStatusService} from '../api/crewstatus.service';
import {DriverMetadata} from '../../model/driver.metadata.model';
import {RouteFamiliarityService} from '../api/routefamiliarity.service';

@Injectable()
export class DriverMetadataService{

  constructor(
    private employeeService: EmployeeService,
    private licenceCategoryService:LicenseCategoryService,
    private crewStatusService:CrewStatusService,
    private routeFamiliarityLevelService:RouteFamiliarityService,
    private regexService:RegexService
  ) {
  }

  loadAll():Observable<DriverMetadata>{
    return forkJoin({
      employees:this.employeeService.getByDesignationDriver().pipe(map(r=>r.data)),
      licenceCategories:this.licenceCategoryService.get().pipe(map(r=>r.data)),
      crewStatuses:this.crewStatusService.get().pipe(map(r=>r.data)),
      routeFamiliarityLevels:this.routeFamiliarityLevelService.get().pipe(map(r=>r.data)),
      regexes:this.regexService.getStaticRegexes('drivers').pipe(map(r=>r.data))
    })
}

}
