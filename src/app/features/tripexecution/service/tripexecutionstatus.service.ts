import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {TripExecutionStatus} from '../entity/tripexecutionstatus';

@Injectable({ providedIn: 'root' })
export class TripExecutionStatusService extends BaseHttpService <TripExecutionStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<TripExecutionStatus>>{
    return  this.getAll(ApiEndpoints.TRIP_EXECUTION_STATUS);
  }

}
