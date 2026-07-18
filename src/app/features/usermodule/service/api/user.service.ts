import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {UserStatus} from '../../entity/userstatus';
import {UserType} from '../../entity/usertype';
import {User} from '../../entity/user';
import {Employee} from '../../../employeemodule/entity/employee';
import {Incident} from '../../../incidentreportmodule/entity/incident';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseHttpService <User>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<User>>{
    return  this.getAll(ApiEndpoints.USERS,params);
  }

  save(user:User):Observable<User>{
    return this.post(ApiEndpoints.USERS,user);
  }

  update(user:User):Observable<User>{
    return this.put(ApiEndpoints.USERS,user);
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.delete<number[]>(
      ApiEndpoints.USER_DEACTIVATE_OR_ACTIVATE,
      {
        body: payload
      }
    );
  }

  changePassword(id: number, data: any): Observable<any> {
    return this.putActionById(
      ApiEndpoints.USERS,
      id,
      'change-password',
      data
    );

  }

  resetPassword(id:number, data:any):Observable<any>{
    return this.putActionById(
      ApiEndpoints.USERS,
      id,
      'reset-password',
      data
    );
  }

}
