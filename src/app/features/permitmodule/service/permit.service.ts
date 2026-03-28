import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Permit} from '../entity/permit';

@Injectable({ providedIn: 'root' })
export class PermitService extends BaseHttpService <Permit>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Permit>>{
    return  this.getAll(ApiEndpoints.PERMIT,params);
  }

  save(permit:Permit):Observable<Permit>{
    return this.post(ApiEndpoints.PERMIT,permit);
  }

  update(permit:Permit):Observable<Permit>{
    return this.put(ApiEndpoints.PERMIT,permit);
  }

  transferPermit(permitId: number): Observable<Permit> {
    return this.putById(ApiEndpoints.PERMIT_TRANSFER, permitId);
  }
}
