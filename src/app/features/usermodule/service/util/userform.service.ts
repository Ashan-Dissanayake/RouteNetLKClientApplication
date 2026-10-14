import {Injectable} from '@angular/core';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {UserLookUpData} from '../../model/user.lookupdata.model';
import {
  USER_FILTER_FORM_META,
  USER_MAIN_FORM_META,
  USER_PASSWORD_CHANGE_FORM_META,
  USER_RESET_PASSWORD_FORM_META,
  USER_ROLE_FORM_META
} from '../../model/user.meta';
import {UserValidators} from './user.validator';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {User} from '../../entity/user';

@Injectable()
export class UserFormService implements CrudFormService<User, UserLookUpData> {

  constructor(
    private formBuilder: FormbuilderService,
  ) {}

  buildFilterForm(
    metadata: UserLookUpData
  ): FormGroup {
    return this.formBuilder.build(
      [...USER_FILTER_FORM_META],
      {
        ssemployee: metadata.employees,
        ssusertype: metadata.userTypes,
      }
    );
  }

  buildMainForm(
    metadata: UserLookUpData
  ): FormGroup {

    const form = this.formBuilder.build(
      [...USER_MAIN_FORM_META],
      {
        employee: metadata.employees,
        usertype: metadata.userTypes,
        userstatus: metadata.userStatuses,
        regexes: metadata.regexes,
      }
    );

    form.addValidators(
      UserValidators.passwordMatch(
        'password',
        'confirmPassword'
      )
    );

    return form;
  }

  buildMainFormForEdit(
    metadata: UserLookUpData,
    row: User
  ): FormGroup {

    const form = this.buildMainForm(metadata);

    form.patchValue(row);

    form.get('password')
      ?.clearValidators();

    form.get('password')
      ?.updateValueAndValidity();

    form.get('confirmPassword')
      ?.clearValidators();

    form.get('confirmPassword')
      ?.updateValueAndValidity();

    return form;
  }

  buildPasswordChangeForm(): FormGroup {
    const form = this.formBuilder.build(
      [...USER_PASSWORD_CHANGE_FORM_META],
      {}
    );

    form.get('newPassword')
      ?.addValidators(
        UserValidators.strongPassword()
      );

    form.addValidators(
      UserValidators.passwordMatch(
        'newPassword',
        'confirmPassword'
      )
    );

    return form;
  }

  buildResetPasswordForm(): FormGroup {
    const form = this.formBuilder.build(
      [...USER_RESET_PASSWORD_FORM_META],
      {}
    );

    form.get('newPassword')
      ?.addValidators(
        UserValidators.strongPassword()
      );

    form.addValidators(
      UserValidators.passwordMatch(
        'newPassword',
        'confirmPassword'
      )
    );

    return form;
  }

  buildUserRoleManagementForm(
    metadata: UserLookUpData
  ): FormGroup {

    return this.formBuilder.build(
      [...USER_ROLE_FORM_META],
      metadata
    );
  }
}
