import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {IncidentStatus} from '../../entity/incidentstatus';
import {IncidentType} from '../../entity/incidenttype';

@Injectable({ providedIn: 'root' })
export class IncidentTypeService extends BaseHttpService <IncidentType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<IncidentType>>{
    return  this.getAll(ApiEndpoints.INCIDENT_TYPES);
  }

}
