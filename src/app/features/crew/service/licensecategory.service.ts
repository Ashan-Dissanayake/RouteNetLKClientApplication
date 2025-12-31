import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {RouteFamiliarityLevel} from '../model/routefamiliaritylevel';
import {LicenseCategory} from '../model/licensecategory';


@Injectable({ providedIn: 'root' })
export class LicenseCategoryService extends BaseHttpService <LicenseCategory>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<LicenseCategory>>{
    return  this.getAll(ApiEndpoints.licenseCategories);
  }

}
