import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {PartStatus} from '../../../sparepartmodule/entity/partstatus';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {GrnStatus} from '../../entity/grnstatus';

@Injectable({ providedIn: 'root' })
export class GrnStatusService extends BaseHttpService <GrnStatus>{
  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<GrnStatus>>{
    return  this.getAll(ApiEndpoints.GRN_STATUS);
  }
}
