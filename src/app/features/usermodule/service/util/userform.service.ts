import {Injectable, OnDestroy} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {UserFacadeService} from './userfacade.service';
import {UserLookUpData} from '../../model/user.lookupdata.model';
import {
  USER_FILTER_FORM_META,
  USER_MAIN_FORM_META,
  USER_PASSWORD_CHANGE_FORM_META,
  USER_RESET_PASSWORD_FORM_META
} from '../../model/user.meta';
import {UserValidators} from './user.validator';

@Injectable()
export class UserFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(metadata: UserLookUpData): FormGroup {
    return this.formBuilder.build([...USER_FILTER_FORM_META], {
      ssemployee: metadata.employees,
      ssusertype: metadata.userTypes,
    });
  }

  // ===== Main form =====
  buildMainForm(lookUpData: UserLookUpData): FormGroup {
    const form = this.formBuilder.build([...USER_MAIN_FORM_META], {
      employee: lookUpData.employees,
      usertype: lookUpData.userTypes,
      userstatus: lookUpData.userStatuses,
      regexes: lookUpData.regexes,
    });

    form.addValidators(
      UserValidators.passwordMatch(
        'password',
        'confirmPassword'
      )
    );

    return form;
  }

  buildPasswordChangeForm(): FormGroup {
    const form = this.formBuilder.build([...USER_PASSWORD_CHANGE_FORM_META], {});
    form.get('newPassword')?.addValidators(UserValidators.strongPassword());
    form.addValidators(UserValidators.passwordMatch('newPassword', 'confirmPassword'));
    return form;
  }

  buildResetPasswordForm(): FormGroup {
    const form = this.formBuilder.build([...USER_RESET_PASSWORD_FORM_META], {});
    form.get('newPassword')?.addValidators(UserValidators.strongPassword());
    form.addValidators(UserValidators.passwordMatch('newPassword', 'confirmPassword'));
    return form;
  }
}


