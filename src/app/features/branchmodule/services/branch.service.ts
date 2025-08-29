import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {BranchType} from '../model/branchtype';
import {BaseHttpService} from '../../../core/basehttp.service';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {BranchtypeService} from './branchtype.service';
import {Branch} from '../model/branch';


@Injectable({ providedIn: 'root' })
export class BranchService extends BaseHttpService <Branch>{

  constructor(protected override http: HttpClient) {
    super(http);
  }


  get():Observable<ApiResponse<Branch>>{
   return  this.getAll(ApiEndpoints.branches);
  }

}
