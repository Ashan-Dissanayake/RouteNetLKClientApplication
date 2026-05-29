import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {EmployeeType} from '../../entity/employeetype';

@Injectable({ providedIn: 'root' })
export class EmployeeTypeService extends BaseHttpService <EmployeeType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<EmployeeType>>{
    return  this.getAll(ApiEndpoints.EMPLOYEE_TYPES);
  }

}
