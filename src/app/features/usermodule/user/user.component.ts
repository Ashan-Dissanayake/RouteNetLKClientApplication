import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {UserFacadeService} from '../service/util/userfacade.service';
import {UserLookUpDataService} from '../service/util/user.lookupdata.service';
import {UserFormService} from '../service/util/userform.service';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  USER_DATA_EXPORT_META,
  USER_FILTER_FORM_META,
  USER_IMMUTABLE_CONTROLLERS_META,
  USER_MAIN_FORM_META,
  USER_PASSWORD_CHANGE_FORM_META,
  USER_RESET_PASSWORD_FORM_META,
  USER_ROLE_FORM_META,
  USER_TABLE_META
} from '../model/user.meta';
import {takeUntil} from 'rxjs';
import {UserLookUpData} from '../model/user.lookupdata.model';
import {User} from '../entity/user';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatDivider} from '@angular/material/divider';
import {NgxPermissionsModule} from 'ngx-permissions';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
    NgIf,
    NgForOf,
    NgClass,
    ReactiveFormsModule,
    ButtonPanelComponent,
    DynamicFieldComponent,
    DataTableComponent,
    SideViewComponent,
    TableCellDirective,

    MatDivider,
    MatIcon,
    MatMenuItem,
    MatMenuTrigger,
    MatIconButton,
    MatMenu,

    NgxPermissionsModule,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  providers: [
    UserFacadeService,
    UserLookUpDataService,
    UserFormService,
  ],
})
export class UserComponent extends BaseComponent<User, UserLookUpData> implements OnDestroy, OnInit{

  protected override readonly config: CrudPageConfig = {
    tableColumns: USER_TABLE_META,
    filterFormMeta: USER_FILTER_FORM_META,
    mainFormMeta: USER_MAIN_FORM_META,
    immutableControllers: USER_IMMUTABLE_CONTROLLERS_META,
    exportMeta: USER_DATA_EXPORT_META,

    actionPanel: buildActionPanel({
      exclude: ['bulk-deactivate'],
    }),

    moduleName: 'User',
    excelFileName: 'users.xlsx',
  };

  protected override facade = inject(UserFacadeService);

  protected override formService = inject(UserFormService);

  protected userRoleForm: FormGroup = new FormGroup({});

  override ngOnInit(): void {
    super.ngOnInit();

    this.facade.metadata$
      .pipe(takeUntil(this.destroy$))
      .subscribe(metadata => {
        this.userRoleForm =
          this.formService.buildUserRoleManagementForm(metadata);
      });
  }

  protected override onRowAction(
    action: string,
    row: User
  ): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
      'change-password': () => this.openChangePassword(row),
      'reset-password': () => this.openResetPassword(row),
      'manageRoles': () => this.openRoleManagement(row),
    };

    if (actions[action]) {
      actions[action]();
    } else {
      this.dialog.showWarning(
        `Unknown row action: ${action}`
      );
    }
  }

  private openChangePassword(user: User): void {
    const passwordForm =
      this.formService.buildPasswordChangeForm();

    this.dialog.showFormPopup({
      heading: 'Change Password',
      form: passwordForm,
      meta: USER_PASSWORD_CHANGE_FORM_META,
      width: '500px',
    }).subscribe(formData => {

      if (!formData) {
        this.formBuilder.resetForm(passwordForm);
        return;
      }

      this.facade
        .changePassword(user.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialog.showSuccess(
              'Password changed successfully.'
            );
          },
          error: err => {
            this.dialog.showErrorMessage(
              'Failed to change password',
              err
            );
          },
        });
    });
  }

  private openResetPassword(user: User): void {
    const form =
      this.formService.buildResetPasswordForm();

    this.dialog.showFormPopup({
      heading: 'Reset Password',
      form,
      meta: USER_RESET_PASSWORD_FORM_META,
      width: '500px',
    }).subscribe(formData => {

      if (!formData) {
        this.formBuilder.resetForm(form);
        return;
      }

      this.facade
        .resetPassword(user.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialog.showSuccess(
              'Password reset successfully.'
            );
          },
          error: err => {
            this.dialog.showErrorMessage(
              'Password reset failed',
              err
            );
          },
        });
    });
  }

  private openRoleManagement(user: User): void {
    this.dialog.showFormPopup({
      heading: 'User Role',
      form: this.userRoleForm,
      meta: USER_ROLE_FORM_META,
      width: '500px',
    }).subscribe(formData => {

      if (!formData) {
        this.formBuilder.resetForm(
          this.userRoleForm
        );
        return;
      }

      this.facade
        .replaceRoles(user.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialog.showSuccess(
              'User roles updated successfully.'
            );
          },

          error: err => {
            this.dialog.showErrorMessage(
              'Failed to update user roles.',
              err
            );
          },

          complete: () => {
            this.formBuilder.resetForm(
              this.userRoleForm
            );
          },
        });
    });
  }

  protected override openCreateForm(): void {
    super.openCreateForm();
  }

  protected override openEditForm(row: User): void {
    super.openEditForm(row);
  }
}
