// define columns: keys must match fields (or nested paths) and labels shown in headers
import {FormField} from '../../shared/models/formfieldata.model';
import {ButtonAction} from '../../shared/component/button-panel/button-panel.component';

export const EmployeeTableMeta= [
  { key: 'number', label: 'Number' },
  { key: 'fullname', label: 'Full Name' },
  { key: 'nic', label: 'NIC' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'branch.name', label: 'Branch' },
  { key: 'designation.name', label: 'Designation' },
  { key: 'department.name', label: 'Department' },
  { key: 'employeestatus.name', label: 'Status' },
  { key: 'actions', label: 'Actions' } // provide a template for this column below
];

export const EmployeeFilterMeta: FormField[] = [
  { name: 'ssname', type: 'text', label: 'Full Name', required: false, mode:"none" },
  { name: 'ssnumber', type: 'text', label: 'Number', required: false, mode: 'none' },
  { name: 'ssdepartment', type: 'select', label: 'Department', required: false, mode: 'options' },
] as FormField[];


export const EmployeeActionPanelMeta: ButtonAction[] = [
  { label: 'Create', type: 'create', icon: 'add' },
  {
    label: 'Export',
    type: 'export',
    icon: 'download',
    dropdown: [
      { label: 'pdf', type: 'export-pdf' },
      { label: 'Excel', type: 'export-excel' }
    ]
  },
  { label: 'Deactivate', type: 'bulk-deactivate', icon: 'delete', disabled: false },
  { label: 'Clear Search', type: 'clear-search', icon: 'cancel' }
];

