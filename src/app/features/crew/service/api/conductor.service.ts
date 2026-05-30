import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {Conductor} from '../../entity/conductor';
import {HttpClient} from '@angular/common/http';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {Observable} from 'rxjs';
import {ApiEndpoints} from '../../../../core/api-endpoints';


@Injectable({ providedIn: 'root' })
export class ConductorService extends BaseHttpService <Conductor>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Conductor>>{
    return  this.getAll(ApiEndpoints.CONDUCTORS,params);
  }

  save(conductor:Conductor):Observable<Conductor>{
    return this.post(ApiEndpoints.CONDUCTORS,conductor);
  }

  update(conductor:Conductor):Observable<Conductor>{
    return this.put(ApiEndpoints.CONDUCTORS,conductor);
  }

}
