import {FormField} from '../../../shared/models/formfieldata.model';

export const INCIDENT_TABLE_META = [
  {key: 'branch.name', label: 'Branch'},
  {key: 'tripexecution.name', label: 'Trip'},
  {key: 'incidenttype.name', label: 'Incident Type'},
  {key: 'regionalarea.name', label: 'Incident Regional Area'},
  {key: 'toreported', label: 'Reported Time'},
  {key: 'doreported', label: 'Reported Date'},
  {key: 'odometeratincident', label: 'Odo: at Incident'},
  {key: 'remarks', label: 'Remarks'},
  {key: 'incidentstatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

export const INCIDENT_FILTER_FORM_META: FormField[] = [
  {name: 'ssincidenttype', type: 'select', label: 'Type', required: false, mode: 'options'},
  {name: 'sstripexecution', type: 'select', label: 'Trip Execution', required: false, mode: 'options'},
  {name: 'ssdoreport', type: 'date', label: 'Incident Date', required: false, mode: 'date'},
] as FormField[];

export const INCIDENT_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Part id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'tripexecution', type: 'select', label: 'Trip Execution', required: true, mode: 'options'},
  {name: 'incidenttype', type: 'select', label: 'Incident Type', required: true, mode: 'options'},
  {name: 'regionalarea', type: 'select', label: 'Incident Regional Area', required: true, mode: 'options'},
  {name: 'toreported', type: 'time-range', label: 'Reported Time', required: true, mode: 'none'},
  {name: 'doreported', type: 'date', label: 'Reported Date', required: true, mode: 'none',
    dateConfig:{ maxDate:new Date() }
  },
  {name: 'odometeratincident', type: 'text', label: 'Odo: at Incident', required: true, mode: 'none'},
  {name: 'remakrs', type: 'text', label: 'Remarks', required: true, mode: 'none'},
  {name: 'incidentstatus', type: 'select', label: 'status', required: true, mode: 'options'},
] as FormField[];

export const INCIDENT_DATA_EXPORT_META = [
  {key: 'branch.name', header: 'Branch'},
  {key: 'tripexecution.routeName', header: 'Trip'},
  {key: 'doreported', header: 'Reported Date'},
  {key: 'toreported', header: 'Reported Time'},
  {key: 'incidentstatus.name', header: 'Status'},
];

