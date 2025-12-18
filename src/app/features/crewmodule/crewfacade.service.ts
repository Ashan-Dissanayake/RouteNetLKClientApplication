import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DriverService} from './service/driver.service';
import {Driver} from './model/driver';

@Injectable({
  providedIn: 'root',
})
export class CrewfacadeService {

  constructor(
    private driverService: DriverService,
  ) {
  }

  // Load data
  loadDrivers(): Observable<Driver[]> {
    return this.getDrivers();
  }

  // Private helpers
  private getDrivers(params?: any): Observable<Driver[]> {
    return this.driverService.get(params).pipe(map(res => res.data));
  }

}
