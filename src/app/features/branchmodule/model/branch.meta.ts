import {FormField} from '../../../shared/models/formfieldata.model';

export const BRANCH_TABLE_META= [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'address', label: 'Address' },
  { key: 'email', label: 'Email' },
  { key: 'telephone', label: 'Telephone' },
  { key: 'docreated', label: 'Date of Created' },
  { key: 'branchtype.name', label: 'Branch Type' },
  { key: 'regionaloffice.name', label: 'Regional Office' },
  { key: 'branchstatus.name', label: 'Branch Status' },
  { key: 'actions', label: 'Actions' }
];

export const BRANCH_FILTER_FORM_META: FormField[] = [
  { name: 'ssname', type: 'text', label: 'Branch Name', required: false, mode:"none" },
  { name: 'sscode', type: 'text', label: 'Branch Code', required: false, mode: 'none' },
  { name: 'ssbranchstatus', type: 'select', label: 'Branch Status', required: false, mode: 'options' },
] as FormField[];

export const BRANCH_MAIN_FORM_META:FormField[] = [
  { name: 'id', type: 'hidden', label: 'Branch id', required: false, mode: 'none'},
  { name: 'name', type: 'text', label: 'Branch Name', required: true, mode: 'regex'},
  { name: 'code', type: 'text', label: 'Branch Code', required: true, mode: 'regex',disabled:true },
  { name: 'address', type: 'text', label: 'Branch Address', required: true, mode: 'regex'},
  { name: 'telephone', type: 'text', label: 'Telephone', required: true, mode: 'regex' },
  { name: 'email', type: 'text', label: 'Email', required: true, mode: 'none',disabled:true },
  { name: 'docreated', type: 'date', label: 'Date of Created', required: true, mode: 'date',defaultValue:new Date(),disabled:true},
  { name: 'remarks', type: 'text', label: 'Remarks', required: false, mode: 'none'},
  { name: 'branchtype', type: 'select', label: 'Branch Type', required: true, mode: 'options'},
  { name: 'regionaloffice', type: 'select', label: 'Regional Office', required: true, mode: 'options'},
  { name: 'branchstatus', type: 'select', label: 'Branch Status', required: true, mode: 'options' }
] as FormField[];

export const BRANCH_DATA_EXPORT_META = [
  { key: 'code', header: 'Code' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' }
]
