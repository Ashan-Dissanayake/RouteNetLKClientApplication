import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Employee} from '../../entity/employee';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseHttpService <Employee>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.EMPLOYEES,params);
  }

  getSummary():Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.EMPLOYEES_SUMMARIES);
  }

  getByDesignationDriver():Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.EMPLOYEES_BY_DRIVER);
  }

  getByDesignationConductor():Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.EMPLOYEES_BY_CONDUCTOR);
  }


  save(employee:Employee):Observable<Employee>{
    return this.post(ApiEndpoints.EMPLOYEES,employee);
  }

  update(employee:Employee):Observable<Employee>{
    return this.put(ApiEndpoints.EMPLOYEES,employee);
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.delete<number[]>(
      ApiEndpoints.EMPLOYEES_DEACTIVATE,
      {
        body: payload
      }
    );
  }

}
