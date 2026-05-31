import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {PartStatus} from '../../entity/partstatus';

@Injectable({ providedIn: 'root' })
export class PartStatusService extends BaseHttpService <PartStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<PartStatus>>{
    return  this.getAll(ApiEndpoints.PART_STATUS);
  }

}
