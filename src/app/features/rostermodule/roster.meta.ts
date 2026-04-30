import {FormField} from '../../shared/models/formfieldata.model';


export const ROSTER_SHIFT_TABLE_META = [
  {key: 'shift.name', label: 'Shift'},
  // {key: 'shift.tostart', label: 'Start Time'},
  // {key: 'shift.toend', label: 'End Time'},
  {key: 'doshift', label: 'Date'},
  {key: 'designation.name', label: 'Role'},
  {key: 'requiredemployeecount', label: 'Count'},
  // {key: 'actions', label: 'Actions'}
];


export const ROSTER_MAIN_FORM_META: FormField[] = [
  // {name: 'id', type: 'hidden', label: 'Part id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {
    name: 'rosterdaterange',
    type: 'date-range',
    label: 'Roster Period',
    required: true,
    dateConfig:{
      range:{
        years:0,months: 0,days:6
      }
    }
  },
] as FormField[];
