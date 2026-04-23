import {Injectable} from '@angular/core';
import {VehicleService} from './service/vehicle.service';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {Vehicle} from './entity/vehicle';
import {ConditionRateService} from './service/conditionrate.service';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {Vehiclestatus} from './entity/vehiclestatus';
import {VehiclestatusService} from './service/vehiclestatus.service';
import {MakeService} from './service/make.service';
import {FueltypeService} from './service/fueltype.service';
import {Make} from './entity/make';
import {Fueltype} from './entity/fueltype';
import {BranchService} from '../branchmodule/services/branch.service';
import {Branch} from '../branchmodule/entity/branch';
import {Regex} from '../../shared/models/regex.model';
import {RegexService} from '../../core/regex.service';
import {Conditionrate} from './entity/conditionrate';
import {ModelService} from './service/model.service';
import {Model} from './entity/model';
import {BustypeService} from './service/bustype.service';
import {Bustype} from './entity/bustype';

@Injectable({
  providedIn: 'root',
})
export class VehicleFacadeService {

  constructor(
    private vehicleService: VehicleService,
    private branchService: BranchService,
    private modelService:ModelService,
    private busTypeService: BustypeService,
    private fuelTypeService: FueltypeService,
    private conditionRateService: ConditionRateService,
    private vehicleStatusService: VehiclestatusService,
    private makeService: MakeService,
    private regexService: RegexService
  ) {
  }

  // Load data
  loadVehicles(): Observable<Vehicle[]> {
    return this.getVehicles();
  }

  loadConditionRates(): Observable<Conditionrate[]> {
    return this.conditionRateService.get().pipe(map(res => res.data));
  }

  loadVehicleStatuses(): Observable<Vehiclestatus[]> {
    return this.vehicleStatusService.get().pipe(map(res => res.data));
  }

  loadMakes(): Observable<Make[]> {
    return this.makeService.get().pipe(map(res => res.data));
  }

  loadModels(): Observable<Model[]> {
    return this.modelService.get().pipe(map(res => res.data));
  }

  loadFuelTypes(): Observable<Fueltype[]> {
    return this.fuelTypeService.get().pipe(map(res => res.data));
  }
  loadBusTypes(): Observable<Bustype[]> {
    return this.busTypeService.get().pipe(map(res => res.data));
  }

  loadBranches(): Observable<Branch[]> {
    return this.branchService.getSummary().pipe(map(res => res.data));
  }

  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('vehicles').pipe(map(res => res.data));
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
