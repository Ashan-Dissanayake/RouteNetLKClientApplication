import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Permit} from '../../entity/permit';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class PermitService extends BaseHttpService<Permit> implements CrudApiService<Permit> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<Permit>> {
    return this.getAll<Permit>(
      ApiEndpoints.PERMIT,
      params
    );
  }

  getSummary(): Observable<ApiResponse<Permit>> {
    return this.getAll<Permit>(
      ApiEndpoints.PERMIT_SUMMARIES
    );
  }

  save(
    permit: Permit
  ): Observable<Permit> {
    return this.post(
      ApiEndpoints.PERMIT,
      permit
    );
  }

  update(
    permit: Permit
  ): Observable<Permit> {
    return this.put(
      ApiEndpoints.PERMIT,
      permit
    );
  }

  // Feature-specific operation.
  // Not part of CrudApiService.
  transferPermit(
    permitId: number
  ): Observable<Permit> {
    return this.putById(
      ApiEndpoints.PERMIT_TRANSFER,
      permitId
    );
  }
}
