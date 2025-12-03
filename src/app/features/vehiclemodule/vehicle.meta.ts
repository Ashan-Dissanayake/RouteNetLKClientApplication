import {FormField} from '../../shared/models/formfieldata.model';
import {ButtonAction} from '../../shared/component/button-panel/button-panel.component';

export const VehicleTableMeta = [
  {key: 'make.name', label: 'Make/Model'},
  {key: 'code', label: 'Code'},
  {key: 'number', label: 'Plate Number'},
  {key: 'seatingcapacity.amount', label: 'Seat Amount'},
  {key: 'yom', label: 'Year of Made'},
  {key: 'dob', label: 'Date of Buy'},
  {key: 'conditionrate.name', label: 'Condition'},
  {key: 'servicetype.name', label: 'Service Type'},
  {key: 'vehiclestatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'} // provide a template for this column below
];

export const VehicleFilterMeta: FormField[] = [
  {name: 'sscode', type: 'text', label: 'Code', required: false, mode: "none"},
  {name: 'sservicetype', type: 'select', label: 'Service Type', required: false, mode: 'options'},
  {name: 'ssconditionrate', type: 'select', label: 'Condition Rate', required: false, mode: 'options'},
] as FormField[];

export const VehicleActionPanelMeta: ButtonAction[] = [
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
