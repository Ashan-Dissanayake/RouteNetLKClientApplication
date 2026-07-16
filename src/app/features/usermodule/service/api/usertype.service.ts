import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {UserStatus} from '../../entity/userstatus';
import {UserType} from '../../entity/usertype';

@Injectable({ providedIn: 'root' })
export class UserTypeService extends BaseHttpService <UserType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<UserType>>{
    return  this.getAll(ApiEndpoints.USER_TYPE);
  }

}
