import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Vehicle} from '../../entity/vehicle';

@Injectable({ providedIn: 'root' })
export class VehicleService extends BaseHttpService <Vehicle>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Vehicle>>{
    return  this.getAll(ApiEndpoints.VEHICLES,params);
  }

  getSummary():Observable<ApiResponse<Vehicle>>{
    return  this.getAll(ApiEndpoints.VEHICLES_SUMMARIES);
  }

  save(vehicle:Vehicle):Observable<Vehicle>{
    return this.post(ApiEndpoints.VEHICLES,vehicle);
  }

  update(vehicle:Vehicle):Observable<Vehicle>{
    return this.put(ApiEndpoints.VEHICLES,vehicle);
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.post<number[]>(ApiEndpoints.VEHICLE_DEACTIVATE,ids);
  }

}
