import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Employee} from '../model/employee';

@Injectable({ providedIn: 'root' })
export class EmployeesService extends BaseHttpService <Employee>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Employee>>{
    return  this.getAll(ApiEndpoints.employees);
  }

}
