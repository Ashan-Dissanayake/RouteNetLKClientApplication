import {FormField} from '../../../shared/models/formfieldata.model';

/**
 * Metadata for the Trip Table, defining the keys and labels for table columns.
 */
export const TRIP_TABLE_META = [
  {key: 'permite.number', label: 'Permit'},
  {key: 'permite.route.name', label: 'Route'},
  {key: 'permite.vehicle', label: 'Bus'},
  {key: 'todepature', label: 'Departure Time'},
  {key: 'toarrival', label: 'Arrival Time'},
  {key: 'triptype.name', label: 'Trip Type'},
  {key: 'opcalender.name', label: 'OP Calender'},
  {key: 'originterminal.name', label: 'Origin Terminal'},
  {key: 'tripstatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

/**
 * Metadata for the Trip Filter Form, defining the fields used for filtering trips.
 * @type {FormField[]}
 */
export const TRIP_FILTER_FORM_META: FormField[] = [
  {name: 'sstriptype', type: 'select', label: 'Bus Type', required: false, mode: 'options'},
  {name: 'sstripstatus', type: 'select', label: 'Trip status', required: false, mode: 'options'},
] as FormField[];

/**
 * Metadata for the Trip Main Form, defining the fields used for creating or editing trips.
 * @type {FormField[]}
 */
export const TRIP_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Trip id', required: false, mode: 'none'},
  {name: 'permite', type: 'select', label: 'Permit', required: true, mode: 'options', optionLabelKey: 'number'},
  {name: 'todepature', type: 'time-range', label: 'Departure Time', required: true, mode: 'none'},
  {name: 'toarrival', type: 'time-range', label: 'Arrival Time', required: true, mode: 'none'},
  {name: 'shift', type: 'select', label: 'Shift', required: true, mode: 'options', optionLabelKey: 'shiftFullName'},
  {name: 'triptype', type: 'select', label: 'Trip Type', required: true, mode: 'options'},
  {name: 'originterminal', type: 'select', label: 'Origin Terminal', required: true, mode: 'options'},
  {name: 'tripstatus', type: 'select', label: 'Status', required: true, mode: 'options'},
  {name: 'opcalender', type: 'select', label: 'OP Calender', required: true, mode: 'options'}
] as FormField[];

/**
 * Metadata for exporting Trip data, defining the keys and headers for export columns.
 */
export const TRIP_DATA_EXPORT_META = [
  { key: 'branch.name', header: 'Branch' },
  {key: 'permite.number', header: 'Permit'},
  {key: 'todeparture', header: 'Departure Time'},
  {key: 'toarrival', header: 'Arrival Time'},
  {key: 'triptype', header: 'Trip Type'},
  {key: 'originterminal', header: 'Origin Terminal'},
];
