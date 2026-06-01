import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {PartStatus} from '../../../sparepartmodule/entity/partstatus';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';

@Injectable({ providedIn: 'root' })
export class PartRequestStatusService extends BaseHttpService <PartStatus>{
  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<PartStatus>>{
    return  this.getAll(ApiEndpoints.PART_REQUEST_STATUS);
  }
}
