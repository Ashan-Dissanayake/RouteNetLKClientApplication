import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {VehicleServiceType} from '../../entity/vehicleservicetype';

@Injectable({ providedIn: 'root' })
export class VehicleServiceTypeService extends BaseHttpService <VehicleServiceType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<VehicleServiceType>>{
    return  this.getAll(ApiEndpoints.VEHICLE_SERVICE_TYPE);
  }

}
