import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../../entity/user';
import {UserService} from '../api/user.service';
import {UserLookUpDataService} from './user.lookupdata.service';
import {EMPTY_USER_LOOK_UP_DATA, UserLookUpData} from '../../model/user.lookupdata.model';
import {UserRoleService} from '../api/userrole.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class UserFacadeService extends BaseFacade<User, UserLookUpData> {

  constructor(
    private userService: UserService,
    private userRoleService: UserRoleService,
    metadataService: UserLookUpDataService,
  ) {
    super(
      userService,
      metadataService,
      EMPTY_USER_LOOK_UP_DATA,
    );
  }

  protected override beforeCreate(
    data: User
  ): User {
    const {
      confirmPassword,
      ...payload
    } = data as User & {
      confirmPassword?: string;
    };

    return payload as User;
  }

  protected override beforeUpdate(
    data: User
  ): User {
    const {
      password,
      confirmPassword,
      ...payload
    } = data as User & {
      password?: string;
      confirmPassword?: string;
    };

    return payload as User;
  }

  changePassword(
    userId: number,
    data: any
  ): Observable<any> {

    const {
      confirmPassword,
      ...payload
    } = data;

    return this.userService.changePassword(
      userId,
      payload
    );
  }

  resetPassword(
    userId: number,
    data: any
  ): Observable<any> {

    const {
      confirmPassword,
      ...payload
    } = data;

    return this.userService.resetPassword(
      userId,
      payload
    );
  }

  replaceRoles(
    userId: number,
    data: any
  ): Observable<any> {
    return this.userRoleService.replaceRoles(
      userId,
      data
    );
  }
}
