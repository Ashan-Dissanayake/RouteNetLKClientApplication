import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {RouteFamiliarityLevel} from '../entity/routefamiliaritylevel';


@Injectable({ providedIn: 'root' })
export class RouteFamiliarityService extends BaseHttpService <RouteFamiliarityLevel>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<RouteFamiliarityLevel>>{
    return  this.getAll(ApiEndpoints.routeFamiliarityLevels);
  }

}
