import {FormField} from '../../../shared/models/formfieldata.model';

export const INCIDENT_VEHICLE_ALLOCATION_TABLE_META = [
  {key: 'incident.name', label: 'Incident'},
  {key: 'vehicle.number', label: 'Vehicle/Bus'},
  {key: 'providedbranch.name', label: 'Provided Branch'},
  {key: 'doassigned', label: 'Assigned Date'},
  {key: 'doreleased', label: 'Released Date'},
  {key: 'incidentvehicleallocationstatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

export const INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: '', required: false, mode: 'none'},
  {name: 'incident', type: 'select', label: 'Incident', required: true, mode: 'options'},
  {name: 'providedbranch', type: 'select', label: 'Provided Branch', required: true, mode: 'options'},
  {name: 'vehicle', type: 'select', label: 'Vehicle', required: true, mode: 'options',optionLabelKey:'number'},
  {name: 'incidentvehicleallocationstatus', type: 'select', label: 'status', required: true, mode: 'options'},
] as FormField[];


export const INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META: FormField[] = [
  {name: 'ssvehicle', type: 'select', label: 'Vehicle', required: false, mode: 'options',optionLabelKey:'number'},
  {name: 'ssdoreleased', type: 'date', label: 'Released0 Date', required: false, mode: 'date'},
] as FormField[];


