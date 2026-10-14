import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RegexService} from '../../../../core/regex.service';
import {EmployeeService} from '../../../employeemodule/services/api/employee.service';
import {CrewStatusService} from '../api/crewstatus.service';
import {RouteFamiliarityService} from '../api/routefamiliarity.service';
import {ConductorMetadata} from '../../model/conductor.metadata.model';
import {CrudMetadataService} from '../../../../applicationframework/crudmetadata.service';

@Injectable()
export class ConductorMetadataService implements CrudMetadataService<ConductorMetadata>{

  constructor(
    private employeeService: EmployeeService,
    private crewStatusService:CrewStatusService,
    private routeFamiliarityLevelService:RouteFamiliarityService,
    private regexService:RegexService
  ) {
  }

  loadAll():Observable<ConductorMetadata>{
    return forkJoin({
      employees:this.employeeService.
        getByDesignationConductor()
        .pipe(map(r=>r.data)),

      crewStatuses:this.crewStatusService
        .get().
        pipe(map(r=>r.data)),

      routeFamiliarityLevels:this.routeFamiliarityLevelService
        .get()
        .pipe(map(r=>r.data)),

      regexes:this.regexService
        .getStaticRegexes('drivers')
        .pipe(map(r=>r.data))
    })
}

}
