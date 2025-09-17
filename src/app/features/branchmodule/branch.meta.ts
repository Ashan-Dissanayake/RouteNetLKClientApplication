import {FormField} from '../../shared/form/formfieldata.model';
import {ButtonAction} from '../../shared/component/button-panel/button-panel.component';

export  const DashBoardMeta = [
  { label: 'Total Branches', value: 1234 },
  { label: 'Active Branches', value: 1000 },
  { label: 'Head', value: 50 },
  { label: 'Regular', value: 184 }
];

export const ActionPannelMeta: ButtonAction[] =[
  { label: 'Create', type: 'create', icon: 'add' },
  {
    label: 'Export', type: 'export', icon: 'download',
    dropdown: [
      { label: 'CSV', type: 'export-csv' },
      { label: 'Excel', type: 'export-excel' }
    ]
  },
  { label: 'Bulk Deactivate', type: 'bulk-deactivate', icon: 'delete',disabled:true },
  { label: 'Clear Search', type: 'clear-search', icon: 'cancel' }
];


export const FormMeta:FormField[] = [
  { name: 'name', type: 'text', label: 'Branch Name', required: true, mode: 'regex'},
  { name: 'code', type: 'text', label: 'Branch Code', required: true, mode: 'regex'},
  { name: 'address', type: 'text', label: 'Branch Address', required: true, mode: 'regex'},
  { name: 'telephone', type: 'text', label: 'Telephone', required: true, mode: 'regex' },
  { name: 'docreated', type: 'date', label: 'Date of Created', required: true, mode: 'date',
    dateConfig:{
    minDate:new Date(),
      maxDate:new Date()
    }
  },
  { name: 'districts', type: 'dualist', label: 'Branch Coverage', required: true, mode: 'options'},
  { name: 'remarks', type: 'text', label: 'Remarks', required: false, mode: 'none'},
  { name: 'branchtype', type: 'select', label: 'Branch Type', required: true, mode: 'options'},
  { name: 'branchstatus', type: 'select', label: 'Branch Status', required: true, mode: 'options' }
] as FormField[];


export const FilterMeta: FormField[] = [
  { name: 'ssname', type: 'text', label: 'Branch Name', required: false, mode:"none" },
  { name: 'sscode', type: 'text', label: 'Branch Code', required: false, mode: 'none' },
  { name: 'ssbranchstatus', type: 'select', label: 'Branch Status', required: false, mode: 'options' },
] as FormField[];

// define columns: keys must match fields (or nested paths) and labels shown in headers
export const TableMeta= [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'address', label: 'Address' },
  { key: 'email', label: 'Email' },
  { key: 'telephone', label: 'Telephone' },
  { key: 'docreated', label: 'Date of Created' },
  { key: 'branchtype.name', label: 'Branch Type' },
  { key: 'branchstatus.name', label: 'Branch Status' },
  { key: 'actions', label: 'Actions' } // provide a template for this column below
];
