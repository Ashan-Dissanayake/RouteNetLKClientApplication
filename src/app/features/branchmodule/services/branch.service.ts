import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../../core/api-endpoints';
import { BaseHttpService } from '../../../core/basehttp.service';
import { ApiResponse } from '../../../shared/models/apiresponse.model';
import { Branch } from '../entity/branch';

/**
 * BranchService - Concrete implementation extending BaseHttpService<Branch>
 * This service gets its own DI registration via @Injectable
 */
@Injectable({ providedIn: 'root' })
export class BranchService extends BaseHttpService<Branch> {

  constructor(http: HttpClient) {
    super(http);
  }

  get(params?: any): Observable<ApiResponse<Branch>> {
    return this.getAll(ApiEndpoints.branches, params);
  }

  getSummary(): Observable<ApiResponse<Branch>> {
    return this.getAll(ApiEndpoints.brancheslist);
  }

  save(branch: Branch): Observable<Branch> {
    return this.post(ApiEndpoints.branches, branch);
  }

  update(branch: Branch): Observable<Branch> {
    return this.put(ApiEndpoints.branches, branch);
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    // Ensure we always send an array to the backend
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.post<number[]>(ApiEndpoints.branchesdeactivate, ids);
  }
}
