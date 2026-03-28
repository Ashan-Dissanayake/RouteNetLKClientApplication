import {FormField} from '../../shared/models/formfieldata.model';

export const PERMIT_TABLE_META = [
  {key: 'number', label: 'Permit Number'},
  {key: 'vehicle.number', label: 'Plate Number'},
  {key: 'doissued', label: 'Issue Date'},
  {key: 'doexpired', label: 'Exp Date'},
  {key: 'branch.name', label: 'Branch'},
  {key: 'servicetype.name', label: 'Service Type'},
  {key: 'route.name', label: 'Route'},
  {key: 'permitestatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];


export const PERMIT_FILTER_FORM_META: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Permit Number', required: false, mode: "none"},
  {name: 'sspermitstatus', type: 'select', label: 'Status', required: false, mode: 'options'},
  {name: 'ssroute', type: 'select', label: 'Route', required: false, mode: 'options'}
] as FormField[];
