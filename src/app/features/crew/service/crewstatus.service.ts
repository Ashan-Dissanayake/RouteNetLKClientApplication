import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {CrewStatus} from '../model/crewstatus';


@Injectable({ providedIn: 'root' })
export class CrewStatusService extends BaseHttpService <CrewStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<CrewStatus>>{
    return  this.getAll(ApiEndpoints.crewStatuses);
  }

}
