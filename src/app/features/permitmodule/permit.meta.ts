import {FormField} from '../../shared/models/formfieldata.model';

export const PERMIT_TABLE_META = [
  {key: 'number', label: 'Permit Number'},
  {key: 'route.name', label: 'Route'},
  {key: 'vehicle.number', label: 'Plate Number'},
  {key: 'doissued', label: 'Issue Date'},
  {key: 'doexpired', label: 'Exp Date'},
  {key: 'branch.name', label: 'Branch'},
  {key: 'servicetype.name', label: 'Service Type'},
  {key: 'permitestatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];


export const PERMIT_FILTER_FORM_META: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Permit Number', required: false, mode: "none"},
  {name: 'sspermitstatus', type: 'select', label: 'Status', required: false, mode: 'options'},
  {name: 'ssroute', type: 'select', label: 'Route', required: false, mode: 'options'}
] as FormField[];

export const PERMIT_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'permit id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'vehicle', type: 'select', label: 'Vehicle', required: true, mode: 'options',optionLabelKey: 'number'},
  {name: 'route', type: 'select', label: 'Route', required: true, mode: 'options'},
  {name: 'number', type: 'text', label: 'Permit Number', required: true, mode: 'regex'},
  {name: 'doissued', type: 'date', label: 'Issued Date', required: true, mode: 'date',
    dateConfig:{ maxDate:new Date() }
  },
  {name: 'doexpired', type: 'date', label: 'Exp Date', required: true, mode: 'date',
    dateConfig:{ minDate:new Date()}
  },
  {name: 'servicetype', type: 'select', label: 'Service Type', required: true, mode: 'options'},
  {name: 'permitestatus', type: 'select', label: 'Permit Status', required: true, mode: 'options'}
] as FormField[];
