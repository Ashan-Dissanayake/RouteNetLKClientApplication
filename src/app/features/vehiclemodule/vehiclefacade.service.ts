import {Injectable} from '@angular/core';
import {VehicleService} from './services/vehicle.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Vehicle} from './model/vehicle';
import {Servicetype} from './model/servicetype';
import {ServicetypeService} from './services/servicetype.service';
import {ConditionrateService} from './services/conditionrate.service';
import {Employee} from '../employeemodule/model/employee';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';

@Injectable({
  providedIn: 'root',
})
export class VehiclefacadeService{

  constructor(
    private vehicleService:VehicleService,
    private servoicetypeService:ServicetypeService,
    private conditionrateService:ConditionrateService,
  ) { }

  // Load data
  loadVehicles(): Observable<Vehicle[]> {
    return this.getVehicles();
  }

  loadServicetypes():Observable<Servicetype[]>{
    return this.servoicetypeService.get().pipe(map(res => res.data));
  }

  loadConditionrates():Observable<Servicetype[]>{
    return this.conditionrateService.get().pipe(map(res => res.data));
  }

  searchVehicle(criteria: Record<string, any>): Observable<Vehicle[]> {
    const normalized = normalizeSearchCriteria(criteria);
    return this.getVehicles(normalized);
  }

  // Private helpers
  private getVehicles(params?: any): Observable<Vehicle[]> {
    return this.vehicleService.get(params).pipe(map(res => res.data));
  }

}
