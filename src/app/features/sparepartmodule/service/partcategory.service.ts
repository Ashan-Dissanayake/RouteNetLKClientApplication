import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {PartCategory} from '../entity/partcategory';

@Injectable({ providedIn: 'root' })
export class PartCategoryService extends BaseHttpService <PartCategory>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<PartCategory>>{
    return  this.getAll(ApiEndpoints.PART_CATEGORY);
  }

}
