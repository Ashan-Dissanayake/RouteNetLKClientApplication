import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {TripExecution} from '../entity/tripexecution';
import {Employee} from '../../employeemodule/entity/employee';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {PartRequest} from '../../partrequestmodule/entity/partrequest';

@Injectable({ providedIn: 'root' })
export class TripExecutionService extends BaseHttpService <TripExecution>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  initialize(data:any):Observable<TripExecution>{
    return this.post(ApiEndpoints.TRIP_EXECUTION_INITIALIZATION,data);
  }

  get(params?:any):Observable<ApiResponse<TripExecution>>{
    return  this.getAll(ApiEndpoints.TRIP_EXECUTION,params);
  }

  assignedResource(data:any):Observable<TripExecution>{
    return this.post(ApiEndpoints.TRIP_EXECUTION_GENERATE_ASSIGNMENT,data);
  }

}
