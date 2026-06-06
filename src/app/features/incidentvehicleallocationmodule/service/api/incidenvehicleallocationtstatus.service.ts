import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {IncidentVehicleAllocationStatus} from '../../entity/incidentvehicleallocationstatus';

@Injectable({ providedIn: 'root' })
export class IncidentVehicleAllocationStatusService extends BaseHttpService <IncidentVehicleAllocationStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<IncidentVehicleAllocationStatus>>{
    return  this.getAll(ApiEndpoints.INCIDENT_VEHICLE_ALLOCATION_STATUS);
  }

}
