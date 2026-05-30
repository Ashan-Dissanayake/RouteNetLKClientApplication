import {FormField} from '../../../shared/models/formfieldata.model';

export const DRIVER_TABLE_META = [
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

export const DRIVER_FILTER_FORM_META: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Driver Number', required: false, mode: "none"},
  {name: 'sscrewstatus', type: 'select', label: 'Crew Status', required: false, mode: 'options'},
  {name: 'ssroutefamilitylevel', type: 'select', label: 'Route Familiarity Level', required: false, mode: 'options'},
] as FormField[];

export const DRIVER_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Vehicle id', required: false, mode: 'none'},
  {name: 'employee', type: 'select', label: 'Name', required: true, mode: 'options',optionLabelKey: 'callingname',},
  // {name: 'number', type: 'text', label: 'Driver Number', required: true, mode: 'regex'},
  {name: 'licensecategory', type: 'select', label: 'License Category', required: true, mode: 'options'},
  {name: 'licensenumber', type: 'text', label: 'License Number', required: true, mode: 'regex'},
  {
    name: 'licenseDateRange',
    type: 'date-range',
    label: 'License Valid Period',
    required: true,
    dateConfig:{
      range:{
        years:4,months: 0,days:0
      }
    }
  },
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

export const DRIVER_IMMUTABLE_CONTROLLERS_META = [
  'employee','number','licensenumber','crewstatus',
]

export const DRIVER_DATA_EXPORT_META = [
  { key: 'employee.callingname', header: 'Driver' },
  { key: 'number', header: 'Driver Number' },
  { key: 'licensenumber', header: 'License Number' },
  {key: 'dolicenseexpired', header: 'License Exp Date'},
  {key: 'domedicalexpired', header: 'Medical Exp Date'},
  {key: 'licensecategory.name', header: 'License Category'},
  {key: 'routefamiliaritylevel.name', header: 'Route Familiarity'},
  {key: 'crewstatus.name', header: 'Status'},
]
