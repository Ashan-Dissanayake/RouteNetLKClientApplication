import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Make} from '../entity/make';

@Injectable({ providedIn: 'root' })
export class MakeService extends BaseHttpService <Make>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Make>>{
    return  this.getAll(ApiEndpoints.make);
  }

}
