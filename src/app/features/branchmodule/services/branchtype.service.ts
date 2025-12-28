import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {BranchType} from '../model/branchtype';
import {BaseHttpService} from '../../../core/basehttp.service';
import {ApiResponse} from '../../../shared/models/apiresponse.model';


@Injectable({ providedIn: 'root' })
export class BranchTypeService extends BaseHttpService <BranchType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }


  get():Observable<ApiResponse<BranchType>>{
   return  this.getAll(ApiEndpoints.branchtypes);
  }

}
