import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConductorService} from './service/conductor.service';
import {Conductor} from './entity/conductor';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {CrewStatusService} from './service/crewstatus.service';
import {RouteFamiliarityService} from './service/routefamiliarity.service';
import {CrewStatus} from './entity/crewstatus';
import {RouteFamiliarityLevel} from './entity/routefamiliaritylevel';
import {Employee} from '../employeemodule/entity/employee';
import {EmployeeService} from '../employeemodule/services/api/employee.service';
import {Regex} from '../../shared/models/regex.model';
import {RegexService} from '../../core/regex.service';
import {DriverMapper} from '../../shared/mappers/DriverMapper';
import {ConductorMapper} from '../../shared/mappers/ConductorMapper';

@Injectable({
  providedIn: 'root',
})
export class ConductorFacadeService {

  constructor(
    private conductorService: ConductorService,
    private crewStatusService: CrewStatusService,
    private employeeService: EmployeeService,
    private routeFamiliarityLevelService: RouteFamiliarityService,
    private regexService:RegexService
  ) {
  }

  // Load data
  loadConductors(): Observable<Conductor[]> {
    return this.getConductors();
  }

  loadCrewStatuses(): Observable<CrewStatus[]> {
    return this.crewStatusService.get().pipe(map(res => res.data));
  }

  loadRouteFamiliarityLevels(): Observable<RouteFamiliarityLevel[]> {
    return this.routeFamiliarityLevelService.get().pipe(map(res => res.data));
  }

  loadEmployeesByDesignation(): Observable<Employee[]> {
    return this.employeeService.getByDesignationConductor().pipe(map(res => res.data));
  }

  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('conductor').pipe(map(res => res.data));
  }

  searchConductor(criteria: Record<string, any>): Observable<Conductor[]> {
    const normalized = normalizeSearchCriteria(criteria);
    return this.getConductors(normalized);
  }

  createConductor(conductorData: Conductor): Observable<Conductor> {
    const status = conductorData.crewstatus?.name?.toLowerCase();
    if (status !="eligible") return throwError(() => new Error('Conductor should be in Eligible'));
    return this.conductorService.save(ConductorMapper.fromForm(conductorData));
  }

  updateConductor(conductorData: any): Observable<Conductor> {
    return this.conductorService.update(ConductorMapper.fromForm(conductorData));
  }

  // Private helpers
  private getConductors(params?: any): Observable<Conductor[]> {
    return this.conductorService.get(params).pipe(map(res => res.data));
  }



}
