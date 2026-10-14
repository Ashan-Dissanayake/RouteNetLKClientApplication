import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {TripExecution} from '../../entity/tripexecution';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class TripExecutionService extends BaseHttpService<TripExecution> implements CrudApiService<TripExecution> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<TripExecution>> {
    return this.getAll<TripExecution>(
      ApiEndpoints.TRIP_EXECUTION,
      params
    );
  }

  initialize(
    data: unknown
  ): Observable<TripExecution> {
    return this.post(
      ApiEndpoints.TRIP_EXECUTION_INITIALIZATION,
      <TripExecution>data
    );
  }

  assignedResource(
    data: unknown
  ): Observable<TripExecution> {
    return this.post(
      ApiEndpoints.TRIP_EXECUTION_GENERATE_ASSIGNMENT,
      <TripExecution>data
    );
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

  getSummary(): Observable<ApiResponse<TripExecution>> {
    return this.getAll<TripExecution>(
      ApiEndpoints.TRIP_EXECUTION_SUMMARIES
    );
  }
}
