import {Injectable} from '@angular/core';
import {VehicleService} from './services/vehicle.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Vehicle} from './model/vehicle';

@Injectable({
  providedIn: 'root',
})
export class VehiclefacadeService{

  constructor(
    private vehicleService:VehicleService
  ) { }

  // Load data
  loadVehicles(): Observable<Vehicle[]> {
    return this.getVehicles();
  }

  // Private helpers
  private getVehicles(params?: any): Observable<Vehicle[]> {
    return this.vehicleService.get(params).pipe(map(res => res.data));
  }

}
