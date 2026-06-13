import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Make} from '../../entity/make';
import {Model} from '../../entity/model';

@Injectable({ providedIn: 'root' })
export class ModelService extends BaseHttpService <Model>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Model>>{
    return  this.getAll(ApiEndpoints.MODEL);
  }

}
