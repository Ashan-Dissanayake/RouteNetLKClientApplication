import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Role} from '../../entity/role';
import {UserRole} from '../../entity/userrole';

@Injectable({ providedIn: 'root' })
export class UserRoleService extends BaseHttpService <UserRole>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  replaceRoles(userId: number, payload: any): Observable<any> {
    return this.http.put(
      `${ApiEndpoints.USER_ROLES}/${userId}/roles`,
      payload
    );
  }


}
