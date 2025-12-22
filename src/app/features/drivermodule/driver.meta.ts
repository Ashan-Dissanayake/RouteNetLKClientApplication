import {FormField} from '../../shared/models/formfieldata.model';

export const DriverTableMeta = [
  {key: 'employee.callingname', label: 'Name'},
  {key: 'number', label: 'Number'},
  {key: 'licensenumber', label: 'License Number'},
  {key: 'dolicenseexpired', label: 'License Exp Date'},
  {key: 'domedicalexpired', label: 'Medical Exp Date'},
  {key: 'licensecategory.name', label: 'License Category'},
  {key: 'routefamiliaritylevel.name', label: 'Route Familiarity'},
  {key: 'crewstatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

export const DriverFilterMeta: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Driver Number', required: false, mode: "none"},
  {name: 'sscrewstatus', type: 'select', label: 'Crew Status', required: false, mode: 'options'},
  {name: 'ssroutefamilitylevel', type: 'select', label: 'Route Familiarity Level', required: false, mode: 'options'},
] as FormField[];

export const DriverFormMeta: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Vehicle id', required: false, mode: 'none'},
  {name: 'employee', type: 'select', label: 'Driver Name', required: true, mode: 'options'},
  {name: 'number', type: 'text', label: 'Driver Number', required: true, mode: 'regex'},
  {name: 'licensenumber', type: 'text', label: 'License Number', required: true, mode: 'regex'},
  {name: 'dolicenseissued', type: 'date', label: 'License Issued Date', required: true, mode: 'date'},
  {name: 'dolicenseexpired', type: 'date', label: 'License Expired Date', required: true, mode: 'date'},
  {name: 'make', type: 'select', label: 'Make/Model', required: true, mode: 'options'},
  {name: 'number', type: 'text', label: 'Number Plate', required: true, mode: 'regex'}
] as FormField[];
