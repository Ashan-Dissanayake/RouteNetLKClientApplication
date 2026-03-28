import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {ServiceType} from '../entity/servicetype';
import {PermitStatus} from '../entity/permitstatus';

@Injectable({ providedIn: 'root' })
export class PermitStatusService extends BaseHttpService <PermitStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<PermitStatus>>{
    return  this.getAll(ApiEndpoints.PERMIT_STATUS);
  }

}
