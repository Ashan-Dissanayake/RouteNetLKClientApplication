import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Vehicle} from '../../entity/vehicle';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class VehicleService
  extends BaseHttpService<Vehicle> implements CrudApiService<Vehicle> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<Vehicle>> {

    return this.getAll<Vehicle>(
      ApiEndpoints.VEHICLES,
      params
    );
  }

  getSummary(): Observable<ApiResponse<Vehicle>> {

    return this.getAll<Vehicle>(
      ApiEndpoints.VEHICLES_SUMMARIES
    );
  }

  save(
    vehicle: Vehicle
  ): Observable<Vehicle> {

    return this.post(
      ApiEndpoints.VEHICLES,
      vehicle
    );
  }

  update(
    vehicle: Vehicle
  ): Observable<Vehicle> {

    return this.put(
      ApiEndpoints.VEHICLES,
      vehicle
    );
  }

  deactivate(
    ids: number[]
  ): Observable<number[]> {

    return this.http.post<number[]>(
      ApiEndpoints.VEHICLE_DEACTIVATE,
      ids
    );
  }
}
