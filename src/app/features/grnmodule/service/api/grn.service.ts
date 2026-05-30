import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Grn} from '../../entity/grn';

@Injectable({ providedIn: 'root' })
export class GrnService extends BaseHttpService <Grn>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Grn>>{
    return  this.getAll(ApiEndpoints.GRN,params);
  }

  update(grn: Grn): Observable<Grn> {
    return this.put(ApiEndpoints.GRN, grn);
  }
}
