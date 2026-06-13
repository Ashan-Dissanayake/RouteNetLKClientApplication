import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {VehicleService} from '../../entity/vehicleservice';

@Injectable({ providedIn: 'root' })
export class VehicleServiceService extends BaseHttpService <VehicleService>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<VehicleService>>{
    return  this.getAll(ApiEndpoints.VEHICLE_SERVICE,params);
  }

  save(vehicleService:VehicleService):Observable<VehicleService>{
    return this.post(ApiEndpoints.VEHICLE_SERVICE,vehicleService);
  }

  startExecution(id: number): Observable<VehicleService> {
    return this.postActionById(
      ApiEndpoints.VEHICLE_SERVICE,
      id,
      'start'
    );
  }

  placeOnHold(id: number): Observable<VehicleService> {
    return this.postActionById(
      ApiEndpoints.VEHICLE_SERVICE,
      id,
      'hold-parts'
    );
  }

  complete(id: number): Observable<VehicleService> {
    return this.postActionById(
      ApiEndpoints.VEHICLE_SERVICE,
      id,
      'complete'
    );
  }

}
