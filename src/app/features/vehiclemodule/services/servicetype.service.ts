import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Vehicle} from '../model/vehicle';
import {Department} from '../../employeemodule/model/department';
import {Servicetype} from '../model/servicetype';

@Injectable({ providedIn: 'root' })
export class ServicetypeService extends BaseHttpService <Servicetype>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Servicetype>>{
    return  this.getAll(ApiEndpoints.servicetype);
  }

}
