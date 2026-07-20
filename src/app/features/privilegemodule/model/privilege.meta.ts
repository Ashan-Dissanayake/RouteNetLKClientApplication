import {FormField} from '../../../shared/models/formfieldata.model';

export const PRIVILEGE_TABLE_META = [
  { key: 'role.name', label: 'Role' },
  { key: 'module.name', label: 'Module' },
  { key: 'operation.displayname', label: 'Operation' },
  { key: 'authority', label: 'Authority' },
  { key: 'actions', label: 'Actions' }
];

export const PRIVILEGE_FILTER_FORM_META: FormField[] = [
  {name: 'ssrole', type: 'select', label: 'Role Name', required: false, mode: "options"},
  {name: 'ssmodule', type: 'select', label: 'Module Name', required: false, mode: 'options'},
  {name: 'ssoperation', type: 'select', label: 'Operation Name', required: false, mode: 'options',optionLabelKey:'displayname'},
] as FormField[];

export const PRIVILEGE_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Id', required: false, mode: 'none'},
  {name: 'role', type: 'select', label: 'Role', required: true, mode: 'options'},
  {name: 'module', type: 'select', label: 'Module', required: true, mode: 'options'},
  {name: 'operation', type: 'select', label: 'Operation', required: true, mode: 'options'},
  {name: 'authority', type: 'text', label: 'Authority', required: true, mode: 'none'},
] as FormField[];

export const PRIVILEGE_IMMUTABLE_CONTROLLERS_META = [
  'authority'
];
