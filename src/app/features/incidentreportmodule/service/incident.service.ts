import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Incident} from '../entity/incident';
import {Trip} from '../../tripmodule/entity/trip';

@Injectable({ providedIn: 'root' })
export class IncidentService extends BaseHttpService <Incident>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Incident>>{
    return  this.getAll(ApiEndpoints.INCIDENTS,params);
  }

  getSummary():Observable<ApiResponse<Incident>>{
    return  this.getAll(ApiEndpoints.INCIDENTS_SUMMARIES);
  }

  save(incident:Incident):Observable<Incident>{
    return this.post(ApiEndpoints.INCIDENTS,incident);
  }

  inProgress(id: number): Observable<Incident> {
    return this.postActionById(
      ApiEndpoints.INCIDENTS,
      id,
      'in-progress'
    );
  }

  vehicleRecovery(id: number): Observable<Incident> {
    return this.postActionById(
      ApiEndpoints.INCIDENTS,
      id,
      'vehicle-recovery'
    );
  }

  pendingAllocation(id: number): Observable<Incident> {
    return this.postActionById(
      ApiEndpoints.INCIDENTS,
      id,
      'pending-allocation'
    );
  }

  resolved(id: number): Observable<Incident> {
    return this.postActionById(
      ApiEndpoints.INCIDENTS,
      id,
      'resolved'
    );
  }

  closed(id: number): Observable<Incident> {
    return this.postActionById(
      ApiEndpoints.INCIDENTS,
      id,
      'closed'
    );
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.post<number[]>(ApiEndpoints.INCIDENTS,payload);
  }

}
