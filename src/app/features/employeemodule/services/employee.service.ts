import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Employee} from '../model/employee';
import {Branch} from '../../branchmodule/model/branch';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseHttpService <Employee>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.employees,params);
  }

}
