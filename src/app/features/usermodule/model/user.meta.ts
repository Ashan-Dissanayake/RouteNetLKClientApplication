import {FormField} from '../../../shared/models/formfieldata.model';

export const USER_TABLE_META = [
  { key: 'username', label: 'Username' },
  { key: 'employee.callingname', label: 'Employee' },
  { key: 'employee.branch.name', label: 'Branch' },
  { key: 'userstatus.name', label: 'Status' },
  { key: 'actions', label: 'Actions' }
];

export const USER_FILTER_FORM_META: FormField[] = [
  {name: 'ssemployee', type: 'select', label: 'Employee Name', required: false, mode: "options",optionLabelKey:'callingname'},
  {name: 'ssuseranme', type: 'text', label: 'User Name', required: false, mode: 'none'},
  {name: 'ssusertype', type: 'select', label: 'User Type', required: false, mode: 'options'},
] as FormField[];

export const USER_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Id', required: false, mode: 'none'},
  {name: 'employee', type: 'select', label: 'Employee', required: true, mode: 'options',optionLabelKey: 'callingname',},
  {name: 'username', type: 'text', label: 'Username', required: true, mode: 'regex'},
  {name: 'password', type: 'password', label: 'Password', required: true, mode: 'regex'},
  {name: 'confirmPassword', type: 'password', label: 'Confirm Password', required: true, mode: 'none'},
  {name: 'usertype', type: 'select', label: 'User Type', required: true, mode: 'options'},

] as FormField[];

export const USER_IMMUTABLE_CONTROLLERS_META = [
  'employee','password','confirmPassword'
];

export const USER_DATA_EXPORT_META = [
  { key: 'username', header: 'Username' },
  { key: 'employee.callingname', header: 'Employee' },
  { key: 'branch.name', header: 'Branch' },
  // { key: 'roles', header: 'Roles' },
  { key: 'accountLocked', header: 'Status' }
];


export const USER_PASSWORD_CHANGE_FORM_META: FormField[] = [
  {name: 'currentPassword', type: 'password', label: 'Current Password', required: true, mode: 'none'},
  {name: 'newPassword', type: 'password', label: 'New Password', required: true, mode: 'none'},
  {name: 'confirmPassword', type: 'password', label: 'Confirm New Password', required: true, mode: 'none'}
];

export const USER_RESET_PASSWORD_FORM_META: FormField[] = [
  {name: 'newPassword', type: 'password', label: 'New Password', required: true, mode: 'none'},
  {name: 'confirmPassword', type: 'password', label: 'Confirm Password', required: true, mode: 'none'}
];

export const USER_ROLE_FORM_META: FormField[] = [
  {name: 'roles', type: 'dualist', label: 'Assigned Roles', required: true, mode: 'options',
    referencePath: ['roles'],optionLabelKey: 'name'
  }
];
