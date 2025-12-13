// define columns: keys must match fields (or nested paths) and labels shown in headers
import {FormField} from '../../shared/models/formfieldata.model';
import {ButtonAction} from '../../shared/component/button-panel/button-panel.component';

export const EmployeeTableMeta = [
  {key: 'number', label: 'Number'},
  {key: 'fullname', label: 'Full Name'},
  {key: 'nic', label: 'NIC'},
  {key: 'mobile', label: 'Mobile'},
  {key: 'email', label: 'Email'},
  {key: 'address', label: 'Address'},
  {key: 'branch.name', label: 'Branch'},
  {key: 'designation.name', label: 'Designation'},
  {key: 'department.name', label: 'Department'},
  {key: 'employeestatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'} // provide a template for this column below
];

export const EmployeeFilterMeta: FormField[] = [
  {name: 'ssname', type: 'text', label: 'Full Name', required: false, mode: "none"},
  {name: 'ssnumber', type: 'text', label: 'Number', required: false, mode: 'none'},
  {name: 'ssdepartment', type: 'select', label: 'Department', required: false, mode: 'options'},
] as FormField[];

export const EmployeeActionPanelMeta: ButtonAction[] = [
  {label: 'Create', type: 'create', icon: 'add'},
  {
    label: 'Export',
    type: 'export',
    icon: 'download',
    dropdown: [
      {label: 'pdf', type: 'export-pdf'},
      {label: 'Excel', type: 'export-excel'}
    ]
  },
  {label: 'Deactivate', type: 'bulk-deactivate', icon: 'delete', disabled: false},
  {label: 'Clear Search', type: 'clear-search', icon: 'cancel'}
];

export const EmployeeFormMeta: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Employee id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'number', type: 'text', label: 'Employee Number', required: true, mode: 'regex'},
  {name: 'fullname', type: 'text', label: 'Full Name', required: true, mode: 'regex'},
  {name: 'callingname', type: 'text', label: 'Calling Name', required: true, mode: 'regex'},
  {name: 'nic', type: 'text', label: 'NIC', required: true, mode: 'regex'},
  {name: 'gender', type: 'select', label: 'Gender', required: true, mode: 'options',disabled:true},
  {name: 'mobile', type: 'text', label: 'Mobile', required: true, mode: 'regex'},
  {name: 'email', type: 'text', label: 'Email Address', required: true, mode: 'none',disabled:true},
  {name: 'address', type: 'text', label: 'Address', required: true, mode: 'regex'},
  {name: 'emergencycontact', type: 'text', label: 'Emergency Contact', required: true, mode: 'regex'},
  {name: 'image', type: 'file', label: 'Image', required: false, mode: 'none'},
  {name: 'doj', type: 'date', label: 'Date of joined', required: true, mode: 'date',
    dateConfig:{
    maxDate:new Date(),
      minDate:new Date(1958, 0, 1)
    }
  },
  {name: 'department', type: 'select', label: 'Department', required: true, mode: 'options'},
  {name: 'designation', type: 'select', label: 'Designation', required: true, mode: 'options'},
  {name: 'employeetype', type: 'select', label: 'Employee Type', required: true, mode: 'options'},
  {name: 'employeestatus', type: 'select', label: 'Employee Status', required: true, mode: 'options'},
] as FormField[];

export const EmployeeExportMeta = [
  { key: 'number', header: 'Number' },
  { key: 'fullname', header: 'FullName' },
  { key: 'email', header: 'District' },
  {key: 'branch.name', header: 'Branch'},
  {key: 'designation.name', header: 'Designation'},
  {key: 'department.name', header: 'Department'},
  {key: 'employeestatus.name', header: 'Status'},
]
