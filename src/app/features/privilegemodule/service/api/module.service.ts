import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Operation} from '../../entity/operation';
import {Module} from '../../entity/module';

@Injectable({ providedIn: 'root' })
export class ModuleService extends BaseHttpService <Module>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Module>>{
    return  this.getAll(ApiEndpoints.MODULE);
  }

}
