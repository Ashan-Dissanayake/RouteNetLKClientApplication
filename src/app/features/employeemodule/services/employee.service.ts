import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Employee} from '../model/employee';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseHttpService <Employee>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.employees,params);
  }

  getSummary():Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.employeesList);
  }
  getByDesignation():Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.employeesByDriver);
  }


  save(employee:Employee):Observable<Employee>{
    return this.post(ApiEndpoints.employees,employee);
  }

  update(employee:Employee):Observable<Employee>{
    return this.put(ApiEndpoints.employees,employee);
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    // Ensure we always send an array to the backend
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.post<number[]>(ApiEndpoints.employeesdeactivate,payload);
  }

}
