import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {User} from '../../entity/user';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseHttpService<User> implements CrudApiService<User> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<User>> {
    return this.getAll(
      ApiEndpoints.USERS,
      params
    );
  }

  save(user: User): Observable<User> {
    return this.post(
      ApiEndpoints.USERS,
      user
    );
  }

  update(user: User): Observable<User> {
    return this.put(
      ApiEndpoints.USERS,
      user
    );
  }

  deactivate(
    ids: number[]
  ): Observable<number[]> {
    return this.http.delete<number[]>(
      ApiEndpoints.USER_DEACTIVATE_OR_ACTIVATE,
      {
        body: ids,
      }
    );
  }

  changePassword(
    id: number,
    data: any
  ): Observable<any> {
    return this.putActionById(
      ApiEndpoints.USERS,
      id,
      'change-password',
      data
    );
  }

  resetPassword(
    id: number,
    data: any
  ): Observable<any> {
    return this.putActionById(
      ApiEndpoints.USERS,
      id,
      'reset-password',
      data
    );
  }
}
