import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {PartRequest} from '../entity/partrequest';

@Injectable({ providedIn: 'root' })
export class PartRequestService extends BaseHttpService <PartRequest>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<PartRequest>>{
    return  this.getAll(ApiEndpoints.PART_REQUEST,params);
  }

  save(partRequest:PartRequest):Observable<PartRequest>{
    return this.post(ApiEndpoints.PART_REQUEST,partRequest);
  }

  approveRequest(id: number): Observable<PartRequest> {
    return this.postActionById(
      ApiEndpoints.PART_REQUEST,
      id,
      'approve'
    );
  }

  rejectRequest(id: number): Observable<PartRequest> {
    return this.postActionById(
      ApiEndpoints.PART_REQUEST,
      id,
      'reject'
    );
  }


}
