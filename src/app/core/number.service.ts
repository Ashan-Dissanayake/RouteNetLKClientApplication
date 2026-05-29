import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from './api-endpoints';
import {BaseHttpService} from './basehttp.service';
import {ApiResponse} from '../shared/models/apiresponse.model';

@Injectable({ providedIn: 'root' })
export class NumberService extends BaseHttpService<any>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  getGeneratedBranchCode(branchName: string): Observable<ApiResponse<string,false>> {
    return this.getObject<string>(`${ApiEndpoints.BRANCH_CODE}/${branchName}`);
  }

  // getGeneratedEmployeeNumber(): Observable<ApiResponse<string,false>> {
  //   return this.getObject<string>(ApiEndpoints.employeenumber);
  // }

}
