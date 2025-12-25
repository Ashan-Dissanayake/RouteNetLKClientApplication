import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {Driver} from '../model/driver';
import {HttpClient} from '@angular/common/http';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {Observable} from 'rxjs';
import {ApiEndpoints} from '../../../core/api-endpoints';


@Injectable({ providedIn: 'root' })
export class DriverService extends BaseHttpService <Driver>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Driver>>{
    return  this.getAll(ApiEndpoints.drivers,params);
  }

  save(driver:Driver):Observable<Driver>{
    return this.post(ApiEndpoints.drivers,driver);
  }

}
