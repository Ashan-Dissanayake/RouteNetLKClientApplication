import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../../../core/api-endpoints';
import { BaseHttpService } from '../../../../applicationframework/basehttp.service';
import { ApiResponse } from '../../../../shared/models/apiresponse.model';
import { Branch } from '../../entity/branch';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';


@Injectable({ providedIn: 'root' })
export class BranchService extends BaseHttpService<Branch> implements CrudApiService<Branch> {

  constructor(http: HttpClient) {
    super(http);
  }

  get(params?: Record<string, unknown>): Observable<ApiResponse<Branch>> {
    return this.getAll<Branch>(
      ApiEndpoints.BRANCHES,
      params
    );
  }

  getSummary(): Observable<ApiResponse<Branch>> {
    return this.getAll<Branch>(
      ApiEndpoints.BRANCH_SUMMARIES
    );
  }

  save(branch: Branch): Observable<Branch> {
    return this.post(
      ApiEndpoints.BRANCHES,
      branch
    );
  }

  update(branch: Branch): Observable<Branch> {
    return this.put(
      ApiEndpoints.BRANCHES,
      branch
    );
  }

  deactivate(ids: number[]): Observable<number[]> {
    return this.http.delete<number[]>(
      ApiEndpoints.BRANCH_DEACTIVATE,
      {
        body: ids
      }
    );
  }
}
