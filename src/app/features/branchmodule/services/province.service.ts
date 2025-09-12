import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {BranchType} from '../model/branchtype';
import {BaseHttpService} from '../../../core/basehttp.service';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {District} from '../model/district';
import {Province} from '../model/province';


@Injectable({ providedIn: 'root' })
export class ProvinceService extends BaseHttpService <Province>{

  constructor(protected override http: HttpClient) {
    super(http);
  }


  get():Observable<ApiResponse<Province>>{
   return  this.getAll(ApiEndpoints.provinces);
  }

}
