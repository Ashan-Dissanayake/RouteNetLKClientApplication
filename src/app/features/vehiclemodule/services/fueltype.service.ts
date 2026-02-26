import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Fueltype} from '../model/fueltype';

@Injectable({ providedIn: 'root' })
export class FueltypeService extends BaseHttpService <Fueltype>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Fueltype>>{
    return  this.getAll(ApiEndpoints.fueltype);
  }

}
