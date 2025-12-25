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

export const DriverFilterFormMeta: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Driver Number', required: false, mode: "none"},
  {name: 'sscrewstatus', type: 'select', label: 'Crew Status', required: false, mode: 'options'},
  {name: 'ssroutefamilitylevel', type: 'select', label: 'Route Familiarity Level', required: false, mode: 'options'},
] as FormField[];

// export const DriverMainFormMeta: FormField[] = [
//   {name: 'id', type: 'hidden', label: 'Vehicle id', required: false, mode: 'none'},
//   {name: 'employee', type: 'select', label: 'Driver Name', required: true, mode: 'options',optionLabelKey: 'callingname', },
//   {name: 'number', type: 'text', label: 'Driver Number', required: true, mode: 'regex'},
//   {name: 'licensenumber', type: 'text', label: 'License Number', required: true, mode: 'regex'},
//   {name: 'dolicenseissued', type: 'date', label: 'License Issued Date', required: true, mode: 'date'},
//   {name: 'dolicenseexpired', type: 'date', label: 'License Expired Date', required: true, mode: 'date'},
//   {name: 'domedicalissued', type: 'date', label: 'Medical Issued Date', required: true, mode: 'date'},
//   {name: 'domedicalexpired', type: 'date', label: 'Medical Expired Date', required: true, mode: 'date'},
//   {name: 'licensecategory', type: 'select', label: 'License Category', required: true, mode: 'options'},
//   {name: 'crewstatus', type: 'select', label: 'Status', required: true, mode: 'options'},
//   {name: 'routefamiliaritylevel', type: 'select', label: 'Route Familiarity Level', required: true, mode: 'options'},
// ] as FormField[];


export const DriverMainFormMeta: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Vehicle id', required: false, mode: 'none'},
  {name: 'employee', type: 'select', label: 'Driver Name', required: true, mode: 'options',optionLabelKey: 'callingname', },
  {name: 'number', type: 'text', label: 'Driver Number', required: true, mode: 'regex'},
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
