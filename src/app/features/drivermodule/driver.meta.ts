import {FormField} from '../../shared/models/formfieldata.model';

export const DriverTableMeta = [
  {key: 'employee.callingname', label: 'Name'},
  {key: 'number', label: 'Number'},
  {key: 'licensenumber', label: 'License Number'},
  {key: 'dolicenseexpired', label: 'License Exp Date'},
  {key: 'domedicalexpired', label: 'Medical Exp Date'},
  {key: 'licensecategory.name', label: 'License Category'},
  {key: 'routefamiliaritylevel.name', label: 'Route Familiarity'},
  {key: 'allowedbustype.name', label: 'Allowed Bus'},
  {key: 'crewstatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

export const DriverFilterMeta: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Driver Number', required: false, mode: "none"},
  {name: 'sscrewstatus', type: 'select', label: 'Crew Status', required: false, mode: 'options'},
  {name: 'ssroutefamilitylevel', type: 'select', label: 'Route Familiarity Level', required: false, mode: 'options'},
] as FormField[];
