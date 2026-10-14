import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {Privilege} from '../../entity/privilege';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService extends BaseHttpService<Privilege> implements CrudApiService<Privilege> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<Privilege>> {

    return this.getAll<Privilege>(
      ApiEndpoints.PRIVILEGE,
      params
    );
  }

  // Feature-specific API operations

  assignPrivileges(
    roleId: number,
    payload: {
      privileges: {
        module: { id: number };
        operation: { id: number };
      }[];
    }
  ) {
    return this.postActionById(
      ApiEndpoints.PRIVILEGE,
      roleId,
      'assign',
      payload
    );
  }

  revokePrivilege(
    roleId: number,
    privilegeId: number
  ) {
    return this.deleteActionByIds(
      ApiEndpoints.PRIVILEGE,
      roleId,
      privilegeId,
      'revoke'
    );
  }
}
