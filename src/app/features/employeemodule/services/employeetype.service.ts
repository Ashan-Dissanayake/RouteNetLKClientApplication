import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Employeetype} from '../entity/employeetype';

@Injectable({ providedIn: 'root' })
export class EmployeeTypeService extends BaseHttpService <Employeetype>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Employeetype>>{
    return  this.getAll(ApiEndpoints.employeetypes);
  }

}
