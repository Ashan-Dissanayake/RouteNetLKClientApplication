import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../../../core/api-endpoints';
import { BaseHttpService } from '../../../../core/basehttp.service';
import { ApiResponse } from '../../../../shared/models/apiresponse.model';
import { Branch } from '../../entity/branch';


@Injectable({ providedIn: 'root' })
export class BranchService extends BaseHttpService<Branch> {

  constructor(http: HttpClient) {
    super(http);
  }

  get(params?: any): Observable<ApiResponse<Branch>> {
    return this.getAll(ApiEndpoints.BRANCHES, params);
  }

  getSummary(): Observable<ApiResponse<Branch>> {
    return this.getAll(ApiEndpoints.BRANCH_SUMMARIES);
  }

  save(branch: Branch): Observable<Branch> {
    return this.post(ApiEndpoints.BRANCHES, branch);
  }

  update(branch: Branch): Observable<Branch> {
    return this.put(ApiEndpoints.BRANCHES, branch);
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.delete<number[]>(
      ApiEndpoints.BRANCH_DEACTIVATE,
      {
        body: payload
      }
    );
  }
}
