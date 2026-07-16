import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {UserStatus} from '../../entity/userstatus';

@Injectable({ providedIn: 'root' })
export class UserStatusService extends BaseHttpService <UserStatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<UserStatus>>{
    return  this.getAll(ApiEndpoints.USER_STATUS);
  }

}
