import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Department} from '../model/department';

@Injectable({ providedIn: 'root' })
export class DepartmentService extends BaseHttpService <Department>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Department>>{
    return  this.getAll(ApiEndpoints.departments);
  }

}
