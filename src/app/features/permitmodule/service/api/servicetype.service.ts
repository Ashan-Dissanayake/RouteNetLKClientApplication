import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {ServiceType} from '../../entity/servicetype';

@Injectable({ providedIn: 'root' })
export class ServiceTypeService extends BaseHttpService <ServiceType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<ServiceType>>{
    return  this.getAll(ApiEndpoints.SERVICE_TYPE);
  }

}
