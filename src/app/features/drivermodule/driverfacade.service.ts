import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {DriverService} from './service/driver.service';
import {Driver} from './model/driver';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {CrewStatusService} from './service/crewstatus.service';
import {RouteFamiliarityService} from './service/routefamiliarity.service';
import {CrewStatus} from './model/crewstatus';
import {RouteFamiliarityLevel} from './model/routefamiliaritylevel';
import {Employee} from '../employeemodule/model/employee';
import {EmployeeService} from '../employeemodule/services/employee.service';
import {LicenseCategory} from './model/licensecategory';
import {Regex} from '../../shared/models/regex.model';
import {RegexService} from '../../core/regex.service';
import {LicenseCategoryService} from './service/licensecategory.service';
import {DriverMapper} from '../../shared/mappers/DriverMapper';

@Injectable({
  providedIn: 'root',
})
export class DriverFacadeService {

  constructor(
    private driverService: DriverService,
    private crewStatusService: CrewStatusService,
    private employeeService: EmployeeService,
    private licenseCategoryService: LicenseCategoryService,
    private routeFamiliarityLevelService: RouteFamiliarityService,
    private regexService:RegexService
  ) {
  }

  // Load data
  loadDrivers(): Observable<Driver[]> {
    return this.getDrivers();
  }

  loadCrewStatuses(): Observable<CrewStatus[]> {
    return this.crewStatusService.get().pipe(map(res => res.data));
  }

  loadRouteFamiliarityLevels(): Observable<RouteFamiliarityLevel[]> {
    return this.routeFamiliarityLevelService.get().pipe(map(res => res.data));
  }

  loadEmployeesByDesignation(): Observable<Employee[]> {
    return this.employeeService.getByDesignation().pipe(map(res => res.data));
  }

  loadLicenseCategories(): Observable<LicenseCategory[]> {
    return this.licenseCategoryService.get().pipe(map(res => res.data));
  }

  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('driver').pipe(map(res => res.data));
  }

  loadDynamicRegexes(licenseCategory: string): Observable<Regex> {
    return this.regexService.getDynamicRegexes('driver', licenseCategory).pipe(map(res => res.data));
  }

  searchDriver(criteria: Record<string, any>): Observable<Driver[]> {
    const normalized = normalizeSearchCriteria(criteria);
    return this.getDrivers(normalized);
  }

  createDriver(driverData: Driver): Observable<Driver> {
    const status = driverData.crewstatus?.name?.toLowerCase();
    if (status !="eligible") return throwError(() => new Error('Driver should be in Eligible'));
    return this.driverService.save(DriverMapper.fromForm(driverData));
  }

  updateDriver(driverData: any): Observable<Driver> {
    return this.driverService.update(DriverMapper.fromForm(driverData));
  }

  // Private helpers
  private getDrivers(params?: any): Observable<Driver[]> {
    return this.driverService.get(params).pipe(map(res => res.data));
  }



}
