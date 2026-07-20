import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {Privilege} from '../../entity/privilege';

@Injectable({
  providedIn:'root'
})
export class PrivilegeService extends BaseHttpService<Privilege> {

  constructor(http: HttpClient){
    super(http);
  }


  get(params?:any):Observable<ApiResponse<Privilege>>{
    return  this.getAll(ApiEndpoints.PRIVILEGE,params);
  }

  assignPrivileges(
    roleId:number,
    payload:any
  ){
    return this.postActionById(
      ApiEndpoints.PRIVILEGE,
      roleId,
      'assign',
      payload
    );
  }


  revokePrivilege(
    roleId:number,
    privilegeId:number
  ){
    return this.deleteActionByIds(
      ApiEndpoints.PRIVILEGE,
      roleId,
      privilegeId,
      'revoke'
    );
  }

}
