import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {async, debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {UserLookUpData} from '../model/user.lookupdata.model';
import {User} from '../entity/user';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
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

@Component({
  selector: 'app-user',
  imports: [
    AsyncPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
    NgIf,
    ButtonPanelComponent,
    DynamicFieldComponent,
    NgForOf,
    ReactiveFormsModule,
    DataTableComponent,
    DatePipe,
    MatDivider,
    NgxPermissionsModule,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass,
    MatMenuItem,
    MatMenuTrigger,
    MatIconButton,
    MatMenu
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  standalone:true,
  providers:[
    UserFacadeService,
    UserLookUpDataService,
    UserFormService,
  ]
})
export class UserComponent  implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns = USER_TABLE_META;
  protected readonly filterFormMeta = USER_FILTER_FORM_META;
  protected readonly mainFormMeta = USER_MAIN_FORM_META;
  protected readonly immutableControllers = USER_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta = USER_DATA_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel();

  // ===== Streams =====
  protected readonly users$: Observable<User[]>;
  protected readonly lookUpData$: Observable<UserLookUpData>;
  protected readonly loading$: Observable<boolean>;
  protected readonly error$: Observable<any>;
  private destroy$ = new Subject<void>();

  // ===== UI state =====
  protected activeRow: User | null = null;
  protected selectedRows = new Set<User>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});
  protected userRoleForm: FormGroup = new FormGroup({});

  constructor(
    private facade: UserFacadeService,
    private formService: UserFormService,
    private formBuilder: FormbuilderService,
    private dialog: DialogService
  ) {
    this.users$ = this.facade.users$;
    this.lookUpData$ = this.facade.lookUpData$;
    this.loading$ = this.facade.loading$;
    this.error$ = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showErrorMessage('Failed to initialize module.', err),
      });

    this.facade.lookUpData$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(meta => {
      this.filterForm = this.formService.buildFilterForm(meta);
      this.mainForm = this.formService.buildMainForm(meta);
      this.userRoleForm = this.formService.buildUserRoleManagementForm(meta);
      this.watchFilterForm();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter =====

  private watchFilterForm(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
    ).subscribe(values => this.facade.filter(values));
  }

  protected reload(): void {
    this.facade.reload();
  }

  // ===== Row interaction =====
  protected onRowClick(row: User): void {
    this.activeRow = row;
  }

  protected onCloseDetailView(): void {
    this.activeRow = null;
  }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.users$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  // ===== Row actions =====
  protected onRowAction(action: string, row: User): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
      'change-password': () => this.openChangePassword(row),
      'reset-password': () => this.openResetPassword(row),
      'manageRoles': () => this.openRoleManagement(row)
    };
    if (actions[action]) actions[action]();
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  private openChangePassword(user: User): void {
    const passwordForm = this.formService.buildPasswordChangeForm();

    this.dialog.showFormPopup({
      heading: 'Change Password', form: passwordForm, meta: USER_PASSWORD_CHANGE_FORM_META, width: '500px'
    }).subscribe(formData => {
      if (formData) {
        this.facade.changePassword(user.id, formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => this.dialog.showSuccess('Password changed successfully'),
            error: (err) => this.dialog.showErrorMessage('Failed to change password', err)
          });
      } else {
        this.formBuilder.resetForm(passwordForm);
      }
    });
  }

  private openResetPassword(user: User): void {
    const form = this.formService.buildResetPasswordForm();

    this.dialog.showFormPopup({
      heading: 'Reset Password', form,
      meta: USER_RESET_PASSWORD_FORM_META, width: '500px'
    }).subscribe(data => {
      if (data) {
        this.facade.resetPassword(user.id, data).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.dialog.showSuccess('Password reset successfully');
          },
          error: (err) => {
            this.dialog.showErrorMessage('Password reset failed', err);
          }
        });
      }
    });
  }

  private openRoleManagement(user: User): void {
    this.dialog.showFormPopup({
      heading: 'User Role',
      form: this.userRoleForm,
      meta: USER_ROLE_FORM_META,
      width: '500px'
    }).subscribe(data => {
      if (!data) {
        this.formBuilder.resetForm(this.userRoleForm);
        return;
      }
      this.facade.replaceRoles(user.id, data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {this.dialog.showSuccess('User roles updated successfully.');},
          error: err => this.dialog.showErrorMessage('Failed to update user roles.', err),
          complete: () => this.formBuilder.resetForm(this.userRoleForm)
        });
    });
  }

  // ===== Action panel =====
  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create': () => this.openCreateForm(),
      'clear-search': () => this.formBuilder.resetForm(this.filterForm),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`No handler for: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'export-pdf': () => this.toPdf(),
      'export-excel': () => this.toExcel(),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`Unhandled dropdown: ${event.type}`);
  }

  // ===== Create =====
  private openCreateForm(): void {
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);

    this.dialog.showFormPopup({
      heading: 'Create User',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width: '900px',
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilder.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    this.facade.create(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialog.showSuccess('User created successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to create', err),
      complete: () => {
        this.facade.reload();
        this.formBuilder.resetForm(this.mainForm);
      },
    });
  }

  // ===== Edit =====
  private openEditForm(row: User): void {
    // Patch the existing form with the row's values then open the same popup
    this.mainForm.patchValue(row);

    // password not required for update
    this.mainForm.get('password')?.clearValidators();
    this.mainForm.get('password')?.updateValueAndValidity();


    this.mainForm.get('confirmPassword')?.clearValidators();
    this.mainForm.get('confirmPassword')?.updateValueAndValidity();

    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, true);

    this.dialog.showFormPopup({
      heading: 'Edit User',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width: '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else this.formBuilder.resetForm(this.mainForm);
    });
  }

  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialog.showSuccess('User updated successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to update', err),
      complete: () => {
        this.facade.reload();
        this.formBuilder.resetForm(this.mainForm);
      },
    });
  }

  // ===== Export =====
  protected toPdf(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to print.');
      return;
    }

    this.dialog.showPrintDialog({
      width: '1500px',
      height: '650px',
      title: 'User Details',
      mode: 'table',
      data: Array.from(this.selectedRows),
      columns: this.exportMeta,
    }).subscribe(result => {
      if (result) {
        this.selectedRows.clear();
        this.selectedCount = 0;
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'branch.xlsx');
  }

  // ===== Template helper =====
  protected trackByField(_: number, field: any): any {
    return field.key ?? _;
  }

}
