import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../../core/basehttp.service';
import { BranchStatus } from '../../entity/branchstatus';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../../../core/api-endpoints';
import { ApiResponse } from '../../../../shared/models/apiresponse.model';

@Injectable({ providedIn: 'root' })
export class BranchStatusService extends BaseHttpService<BranchStatus> {

  constructor(http: HttpClient) {
    super(http);
  }

  get(): Observable<ApiResponse<BranchStatus>> {
    return this.getAll(ApiEndpoints.BRANCH_STATUSES);
  }

}
