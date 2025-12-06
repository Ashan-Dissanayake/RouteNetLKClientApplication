import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Vehicle} from '../model/vehicle';
import {Employee} from '../../employeemodule/model/employee';

@Injectable({ providedIn: 'root' })
export class VehicleService extends BaseHttpService <Vehicle>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Vehicle>>{
    return  this.getAll(ApiEndpoints.vehicles,params);
  }

  save(vehicle:Vehicle):Observable<Vehicle>{
    return this.post(ApiEndpoints.vehicles,vehicle);
  }

}
