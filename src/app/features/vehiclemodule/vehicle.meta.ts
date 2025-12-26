import {FormField} from '../../shared/models/formfieldata.model';
import {ButtonAction} from '../../shared/component/button/button-panel/button-panel.component';

export const VehicleTableMeta = [
  {key: 'seatingcapacity.make.name', label: 'Make/Model'},
  {key: 'code', label: 'Code'},
  {key: 'number', label: 'Plate Number'},
  {key: 'seatingcapacity.amount', label: 'Seat Amount'},
  {key: 'yom', label: 'Year of Made'},
  {key: 'dob', label: 'Date of Buy'},
  {key: 'conditionrate.name', label: 'Condition'},
  {key: 'servicetype.name', label: 'Service Type'},
  {key: 'seatingcapacity.make.airconditioned', label: 'Air Conditioned'},
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

export const VehicleFormMeta: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Vehicle id', required: false, mode: 'none'},
  {name: 'make', type: 'select', label: 'Make/Model', required: true, mode: 'options'},
  {name: 'code', type: 'text', label: 'Vehicle Code', required: true, mode: 'regex'},
  {name: 'number', type: 'text', label: 'Number Plate', required: true, mode: 'regex'},
  {name: 'yom', type: 'number', label: 'Year of Made', required: true, mode: 'none'},
  {name: 'dob', type: 'date', label: 'Date of Buy', required: true, mode: 'date',
    dateConfig:{
      maxDate:new Date(),
      minDate:new Date(1958, 0, 1)
    }},
  {name: 'chasisnumber', type: 'text', label: 'Chassis Number', required: true, mode: 'none'},
  {name: 'enginenumber', type: 'text', label: 'Engine Number', required: true, mode: 'none'},
  {name: 'fueltype', type: 'select', label: 'Fuel Type', required: true, mode: 'options'},
  {name: 'mileage', type: 'text', label: 'Mileage', required: true, mode: 'none'},
  {name: 'seatingcapacity', type: 'select', label: 'Seating Capacity', required: true, mode: 'options',optionLabelKey: 'amount'},
  {name: 'conditionrate', type: 'select', label: 'Condition Rate', required: true, mode: 'options'},
  {name: 'servicetype', type: 'select', label: 'Service Type', required: true, mode: 'options'},
  {name: 'vehiclestatus', type: 'select', label: 'Status', required: true, mode: 'options'},
  {name: 'remarks', type: 'text', label: 'Remakrs', required: false, mode: 'none'},
  {name: 'employee', type: 'select', label: 'Employee', required: true, mode: 'options',optionLabelKey: 'callingname',},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'}
] as FormField[];

export const VehicleExportMeta = [
  { key: 'code', header: 'Code' },
  { key: 'number', header: 'Number' },
  { key: 'mileage', header: 'Mileage' },
  {key: 'seatingcapacity.amount', header: 'Seating Capacity'},
  {key: 'conditionrate.name', header: 'Condition'},
  {key: 'vehiclestatus.name', header: 'Status'},
]

export const VehicleImmutableControllersMeta = [
  'make', 'code', 'number', 'yom', 'dob',
  'chasisnumber', 'enginenumber', 'mileage',
  'seatingcapacity', 'employee', 'branch'
]
