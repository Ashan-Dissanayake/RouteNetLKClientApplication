import {FormField} from '../../shared/models/formfieldata.model';

export const CONDUCTOR_TABLE_META = [
  {key: 'employee.callingname', label: 'Name'},
  {key: 'number', label: 'Number'},
  {key: 'domedicalexpired', label: 'Medical Exp Date'},
  {key: 'routefamiliaritylevel.name', label: 'Route Familiarity'},
  {key: 'crewstatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

export const CONDUCTOR_FILTER_FORM_META: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Conductor Number', required: false, mode: "none"},
  {name: 'sscrewstatus', type: 'select', label: 'Crew Status', required: false, mode: 'options'},
  {name: 'ssroutefamilitylevel', type: 'select', label: 'Route Familiarity Level', required: false, mode: 'options'},
] as FormField[];

export const CONDUCTOR_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Conductor id', required: false, mode: 'none'},
  {name: 'employee', type: 'select', label: 'Name', required: true, mode: 'options',optionLabelKey: 'callingname',},
  {
    name: 'medicalDateRange',
    type: 'date-range',
    label: 'Medical Valid Period',
    required: true,
    dateConfig:{
      range: {years:0,months:6,days: 0}
    }
  },
  {name: 'crewstatus', type: 'select', label: 'Status', required: true, mode: 'options'},
  {name: 'routefamiliaritylevel', type: 'select', label: 'Route Familiarity Level', required: true, mode: 'options'},
] as FormField[];

export const CONDUCTOR_IMMUTABLE_CONTROLLERS_META = [
  'employee','number'
]

export const CONDUCTOR_DATA_EXPORT_META = [
  { key: 'employee.callingname', header: 'Conductor' },
  { key: 'number', header: 'Conductor Number' },
  {key: 'domedicalexpired', header: 'Medical Exp Date'},
  {key: 'routefamiliaritylevel.name', header: 'Route Familiarity'},
  {key: 'crewstatus.name', header: 'Status'},
]
