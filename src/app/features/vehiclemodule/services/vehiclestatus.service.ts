import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Vehicle} from '../model/vehicle';
import {Department} from '../../employeemodule/model/department';
import {Servicetype} from '../model/servicetype';
import {Fueltype} from '../model/fueltype';
import {Make} from '../model/make';
import {Vehiclestatus} from '../model/vehiclestatus';

@Injectable({ providedIn: 'root' })
export class VehiclestatusService extends BaseHttpService <Vehiclestatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Vehiclestatus>>{
    return  this.getAll(ApiEndpoints.vehiclestatus);
  }

}
