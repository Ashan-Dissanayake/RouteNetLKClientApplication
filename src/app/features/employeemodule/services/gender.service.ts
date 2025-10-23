import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Gender} from '../model/gender';

@Injectable({ providedIn: 'root' })
export class GenderService extends BaseHttpService <Gender>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Gender>>{
    return  this.getAll(ApiEndpoints.genders);
  }

}
