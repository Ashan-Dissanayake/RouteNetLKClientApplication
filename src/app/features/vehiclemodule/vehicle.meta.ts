import {FormField} from '../../shared/models/formfieldata.model';

export const VEHICLE_TABLE_META = [
  {key: 'number', label: 'Plate Number'},
  {key: 'model.name', label: 'Model'},
  {key: 'bustype.name', label: 'Bus Type'},
  {key: 'mileage', label: 'Mileage'},
  {key: 'fueltype.name', label: 'Fuel Type'},
  {key: 'conditionrate.name', label: 'Condition'},
  {key: 'vehiclestatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'} // provide a template for this column below
];

export const VEHICLE_FILTER_FORM_META: FormField[] = [
  {name: 'ssbustype', type: 'select', label: 'Bus Type', required: false, mode: 'options'},
  {name: 'ssconditionrate', type: 'select', label: 'Condition Rate', required: false, mode: 'options'},
] as FormField[];

export const VEHICLE_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Vehicle id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'number', type: 'text', label: 'Number Plate', required: true, mode: 'regex'},
  {name: 'make', type: 'select', label: 'Make', required: true, mode: 'options'},
  {name: 'model', type: 'select', label: 'Model', required: true, mode: 'options'},
  {name: 'bustype', type: 'select', label: 'Bus Type', required: true, mode: 'options'},
  {name: 'mileage', type: 'text', label: 'Mileage', required: true, mode: 'none'},
  {name: 'fueltype', type: 'select', label: 'Fuel Type', required: true, mode: 'options'},
  {name: 'conditionrate', type: 'select', label: 'Condition Rate', required: true, mode: 'options'},
  {name: 'vehiclestatus', type: 'select', label: 'Status', required: true, mode: 'options'},
  {name: 'remarks', type: 'text', label: 'Remakrs', required: false, mode: 'none'}
] as FormField[];

export const VEHICLE_IMMUTABLE_CONTROLLERS_META = [
  'make', 'model', 'number','mileage','branch','bustype'
]

export const VEHICLE_DATA_EXPORT_META = [
  { key: 'number', header: 'Number' },
  { key: 'mileage', header: 'Mileage' },
  {key: 'conditionrate.name', header: 'Condition'},
  {key: 'vehiclestatus.name', header: 'Status'},
]


