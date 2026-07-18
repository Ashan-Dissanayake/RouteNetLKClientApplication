import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {UserStatus} from '../../entity/userstatus';
import {UserType} from '../../entity/usertype';
import {Role} from '../../entity/role';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseHttpService <Role>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Role>>{
    return  this.getAll(ApiEndpoints.ROLES);
  }

}
