import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Make} from '../../entity/make';
import {Model} from '../../entity/model';
import {Bustype} from '../../entity/bustype';

@Injectable({ providedIn: 'root' })
export class BustypeService extends BaseHttpService <Bustype>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Bustype>>{
    return  this.getAll(ApiEndpoints.bustype);
  }

}
