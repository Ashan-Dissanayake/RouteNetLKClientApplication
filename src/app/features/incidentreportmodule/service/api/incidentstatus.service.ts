import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {IncidentStatus} from '../../entity/incidentstatus';

@Injectable({ providedIn: 'root' })
export class IncidentStatusService extends BaseHttpService <IncidentStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<IncidentStatus>>{
    return  this.getAll(ApiEndpoints.INCIDENT_STATUS);
  }

}
