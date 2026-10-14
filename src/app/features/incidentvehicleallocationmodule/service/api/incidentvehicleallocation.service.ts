import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {IncidentVehicleAllocation} from '../../entity/incidentvehicleallocation';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class IncidentVehicleAllocationService extends BaseHttpService<IncidentVehicleAllocation> implements CrudApiService<IncidentVehicleAllocation> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<IncidentVehicleAllocation>> {

    return this.getAll<IncidentVehicleAllocation>(
      ApiEndpoints.INCIDENT_VEHICLE_ALLOCATION,
      params
    );
  }

  save(
    allocation: IncidentVehicleAllocation
  ): Observable<IncidentVehicleAllocation> {

    return this.post(
      ApiEndpoints.INCIDENT_VEHICLE_ALLOCATION,
      allocation
    );
  }

  inProgress(
    id: number
  ): Observable<IncidentVehicleAllocation> {

    return this.postActionById(
      ApiEndpoints.INCIDENT_VEHICLE_ALLOCATION,
      id,
      'in-progress'
    );
  }

  released(
    id: number
  ): Observable<IncidentVehicleAllocation> {

    return this.postActionById(
      ApiEndpoints.INCIDENT_VEHICLE_ALLOCATION,
      id,
      'released'
    );
  }

  pendingAllocation(
    id: number
  ): Observable<IncidentVehicleAllocation> {

    return this.postActionById(
      ApiEndpoints.INCIDENT_VEHICLE_ALLOCATION,
      id,
      'pending-allocation'
    );
  }

  cancelled(
    id: number
  ): Observable<IncidentVehicleAllocation> {

    return this.postActionById(
      ApiEndpoints.INCIDENT_VEHICLE_ALLOCATION,
      id,
      'cancelled'
    );
  }
}
