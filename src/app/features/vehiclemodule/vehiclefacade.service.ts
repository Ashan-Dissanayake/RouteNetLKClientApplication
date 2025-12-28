import {Injectable} from '@angular/core';
import {VehicleService} from './services/vehicle.service';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {Vehicle} from './model/vehicle';
import {Servicetype} from './model/servicetype';
import {ServicetypeService} from './services/servicetype.service';
import {ConditionRateService} from './services/conditionrate.service';
import {Employee} from '../employeemodule/model/employee';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {Vehiclestatus} from './model/vehiclestatus';
import {VehiclestatusService} from './services/vehiclestatus.service';
import {MakeService} from './services/make.service';
import {FueltypeService} from './services/fueltype.service';
import {SeatingcapacityService} from './services/seatingcapacity.service';
import {Make} from './model/make';
import {Fueltype} from './model/fueltype';
import {Seatingcapacity} from './model/seatingcapacity';
import {EmployeeService} from '../employeemodule/services/employee.service';
import {BranchService} from '../branchmodule/services/branch.service';
import {Branch} from '../branchmodule/model/branch';
import {Regex} from '../../shared/models/regex.model';
import {RegexService} from '../../core/regex.service';

@Injectable({
  providedIn: 'root',
})
export class VehicleFacadeService {

  constructor(
    private vehicleService: VehicleService,
    private serviceTypeService: ServicetypeService,
    private vehicleStatusService: VehiclestatusService,
    private makeService: MakeService,
    private fuelTypeService: FueltypeService,
    private conditionRateService: ConditionRateService,
    private seatingCapacityService: SeatingcapacityService,
    private employeeService: EmployeeService,
    private branchService: BranchService,
    private regexService: RegexService
  ) {
  }

  // Load data
  loadVehicles(): Observable<Vehicle[]> {
    return this.getVehicles();
  }

  loadServiceTypes(): Observable<Servicetype[]> {
    return this.serviceTypeService.get().pipe(map(res => res.data));
  }

  loadConditionRates(): Observable<Servicetype[]> {
    return this.conditionRateService.get().pipe(map(res => res.data));
  }

  loadVehicleStatuses(): Observable<Vehiclestatus[]> {
    return this.vehicleStatusService.get().pipe(map(res => res.data));
  }

  loadMakes(): Observable<Make[]> {
    return this.makeService.get().pipe(map(res => res.data));
  }

  loadFuelTypes(): Observable<Fueltype[]> {
    return this.fuelTypeService.get().pipe(map(res => res.data));
  }

  loadSeatingCapacities(): Observable<Seatingcapacity[]> {
    return this.seatingCapacityService.get().pipe(map(res => res.data));
  }

  loadBranches(): Observable<Branch[]> {
    return this.branchService.getSummary().pipe(map(res => res.data));
  }

  loadEmployees(): Observable<Employee[]> {
    return this.employeeService.getSummary().pipe(map(res => res.data));
  }

  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('vehicles').pipe(map(res => res.data));
  }

  loadDynamicRegexes(model: string): Observable<Regex> {
    return this.regexService.getDynamicRegexes('vehicles', model).pipe(map(res => res.data));
  }

  searchVehicles(criteria: Record<string, any>): Observable<Vehicle[]> {
    const normalized = normalizeSearchCriteria(criteria);
    return this.getVehicles(normalized);
  }

  createVehicle(vehicleData: Vehicle): Observable<Vehicle> {
    const status = vehicleData.vehiclestatus?.name?.toLowerCase();
    const conditionrate = vehicleData.conditionrate?.name?.toLowerCase();

    if (status === 'available' && conditionrate !="poor" && conditionrate !="critical") {
      return this.vehicleService.save(vehicleData);
    }
    return throwError(() => new Error('Vehicle should be Available'));
  }

  updateVehicle(vehicleData: any): Observable<Vehicle> {
    return this.vehicleService.update(vehicleData);
  }

  deleteVehicles(vehicles: Vehicle[]): Observable<number[]> {
    if (!vehicles || vehicles.length === 0) {
      return throwError(() => new Error('No vehicle selected'));
    }

    const allowedStatuses = ['decommissioned', 'out of service'];

    const vehicleIds = vehicles
      .filter(v =>
        allowedStatuses.includes((v.vehiclestatus?.name ?? '').toLowerCase())
      )
      .map(v => v.id!)
      .filter(id => id != null);

    if (vehicleIds.length === 0) {
      return throwError(() =>
        new Error('Only vehicles with status OUT OF SERVICE or DECOMMISSIONED can be deactivated')
      );
    }

    return this.vehicleService.deactivate(vehicleIds);
  }

  // Private helpers
  private getVehicles(params?: any): Observable<Vehicle[]> {
    return this.vehicleService.get(params).pipe(map(res => res.data));
  }

}
