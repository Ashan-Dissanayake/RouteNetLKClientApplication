import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Designation} from '../../entity/designation';

@Injectable({ providedIn: 'root' })
export class DesignationService extends BaseHttpService <Designation>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Designation>>{
    return  this.getAll(ApiEndpoints.DESIGNATIONS);
  }

}
