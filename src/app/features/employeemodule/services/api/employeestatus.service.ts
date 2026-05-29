import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {EmployeeStatus} from '../../entity/employeestatus';

@Injectable({ providedIn: 'root' })
export class EmployeeStatusService extends BaseHttpService <EmployeeStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<EmployeeStatus>>{
    return  this.getAll(ApiEndpoints.EMPLOYEE_STATUSES);
  }

}
