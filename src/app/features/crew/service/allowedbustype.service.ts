import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {AllowedBusType} from '../model/allowedbustype';


@Injectable({ providedIn: 'root' })
export class AllowedBusTypeService extends BaseHttpService <AllowedBusType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<AllowedBusType>>{
    return  this.getAll(ApiEndpoints.allowedBusTypes);
  }

}
