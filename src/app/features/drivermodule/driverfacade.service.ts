import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DriverService} from './service/driver.service';
import {Driver} from './model/driver';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {AllowedBusTypeService} from './service/allowedbustype.service';
import {CrewStatusService} from './service/crewstatus.service';
import {RouteFamiliarityService} from './service/routefamiliarity.service';
import {CrewStatus} from './model/crewstatus';
import {AllowedBusType} from './model/allowedbustype';
import {RouteFamiliarityLevel} from './model/routefamiliaritylevel';

@Injectable({
  providedIn: 'root',
})
export class DriverFacadeService {

  constructor(
    private driverService: DriverService,
    private allowedBusTypeService: AllowedBusTypeService,
    private crewStatusService: CrewStatusService,
    private routeFamiliarityLevelService: RouteFamiliarityService,
  ) {
  }

  // Load data
  loadDrivers(): Observable<Driver[]> {
    return this.getDrivers();
  }

  loadCrewStatuses(): Observable<CrewStatus[]> {
    return this.crewStatusService.get().pipe(map(res => res.data));
  }

  loadAllowedBusTypes(): Observable<AllowedBusType[]> {
    return this.allowedBusTypeService.get().pipe(map(res => res.data));
  }

  loadRouteFamiliarityLevels(): Observable<RouteFamiliarityLevel[]> {
    return this.routeFamiliarityLevelService.get().pipe(map(res => res.data));
  }

  searchDriver(criteria: Record<string, any>): Observable<Driver[]> {
    const normalized = normalizeSearchCriteria(criteria);
    return this.getDrivers(normalized);
  }

  // Private helpers
  private getDrivers(params?: any): Observable<Driver[]> {
    return this.driverService.get(params).pipe(map(res => res.data));
  }

}
