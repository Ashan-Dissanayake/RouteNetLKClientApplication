import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {VehicleServicePriority} from '../../entity/vehicleservicepriority';

@Injectable({ providedIn: 'root' })
export class VehicleServicePriorityService extends BaseHttpService <VehicleServicePriority>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<VehicleServicePriority>>{
    return  this.getAll(ApiEndpoints.VEHICLE_SERVICE_PRIORITY);
  }

}
