import {FormField} from '../../../shared/models/formfieldata.model';
import {getTomorrow} from '../../../shared/util/date.util';


export const ROSTER_SHIFT_TABLE_META = [
  {key: 'shift.name', label: 'Shift'},
  {key: 'doshift', label: 'Date'},
  {key: 'designation.name', label: 'Role'},
  {key: 'requiredemployeecount', label: 'Count'},
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
      },
      minDate:getTomorrow()
    },
    mode:"date"
  }
];

