import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {PartRequest} from '../../entity/partrequest';
import {Part} from '../../../sparepartmodule/entity/part';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class PartRequestService extends BaseHttpService<PartRequest> implements CrudApiService<PartRequest> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<PartRequest>> {

    return this.getAll<PartRequest>(
      ApiEndpoints.PART_REQUEST,
      params
    );
  }

  getSummary(): Observable<ApiResponse<PartRequest>> {

    return this.getAll<PartRequest>(
      ApiEndpoints.PART_REQUEST_SUMMARIES
    );
  }

  save(
    partRequest: PartRequest
  ): Observable<PartRequest> {

    return this.post(
      ApiEndpoints.PART_REQUEST,
      partRequest
    );
  }

  approveRequest(
    id: number
  ): Observable<PartRequest> {

    return this.postActionById(
      ApiEndpoints.PART_REQUEST,
      id,
      'approve'
    );
  }

  rejectRequest(
    id: number
  ): Observable<PartRequest> {

    return this.postActionById(
      ApiEndpoints.PART_REQUEST,
      id,
      'reject'
    );
  }
}
