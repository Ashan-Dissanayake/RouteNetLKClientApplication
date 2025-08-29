import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {BranchType} from '../model/branchtype';
import {BaseHttpService} from '../../../core/basehttp.service';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {District} from '../model/district';


@Injectable({ providedIn: 'root' })
export class DistrictService extends BaseHttpService <District>{

  constructor(protected override http: HttpClient) {
    super(http);
  }


  get():Observable<ApiResponse<District>>{
   return  this.getAll(ApiEndpoints.districts);
  }

}
