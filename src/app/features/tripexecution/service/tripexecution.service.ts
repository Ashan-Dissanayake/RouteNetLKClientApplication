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

  checkedIn(id: number): Observable<TripExecution> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'checked-in'
    );
  }

  dispatched(id: number): Observable<TripExecution> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'dispatched'
    );
  }

  inProgress(id: number): Observable<TripExecution> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'in-progress'
    );
  }

  arrived(id: number): Observable<TripExecution> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'arrived'
    );
  }

  breakdown(id: number): Observable<TripExecution> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'breakdown'
    );
  }

  completed(id: number): Observable<TripExecution> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'completed'
    );
  }

  cancelled(id: number): Observable<TripExecution> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'cancelled'
    );
  }

}
