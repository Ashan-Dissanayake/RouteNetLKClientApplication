import {FormField} from '../../../shared/models/formfieldata.model';

export const TRIP_EXECUTION_TABLE_META = [
  {key: 'branch.name', label: 'Branch'},
  {key: 'routeName', label: 'Route'},
  {key: 'doservice', label: 'Service Date'},
  {key: 'plannedDeparture', label: 'Planned Departure Time'},
  {key: 'plannedArrival', label: 'Planned Arrival Time'},
  {key: 'tripType', label: 'Trip Type'},
  {key: 'vehicleNumber', label: 'Bus Number'},
  {key: 'driverName', label: 'Driver Name'},
  {key: 'conductorName', label: 'Conductor Name'},
  {key: 'startodometer', label: 'Start Odo:'},
  {key: 'endodometer', label: 'Start Odo:'},
  {key: 'passengercount', label: 'Passenger Count'},
  {key: 'status', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

// export const TRIP_EXECUTION_FILTER_FORM_META: FormField[] = [
//   {name: 'ssdoservice', type: 'date', label: 'Service Date', required: false, mode: 'date'},
//   {name: 'sstripexecutionstatus', type: 'select', label: 'Status', required: false, mode: 'options'},
// ] as FormField[];

export const TRIP_EXECUTION_MAIN_FORM_META: FormField[] = [
  // {name: 'id', type: 'hidden', label: 'Part id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'doservice', type: 'date', label: 'Service Date', required: true, mode: 'date',
    dateConfig:{
      minDate:getTomorrow()

    }
  },
] as FormField[];


function getTomorrow(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}


// export const TRIP_EXECUTION_UPDATE_FORM_META:FormField[] = [
//   {name: 'startodometer', type: 'text', label: 'Start Odometer', required: false, mode: 'none'},
//   {name: 'endodometer', type: 'text', label: 'End Odometer', required: false, mode: 'none'},
//   {name: 'passengercount', type: 'text', label: 'Passenger Count', required: false, mode: 'none'},
// ]

// export const TRIP_EXECUTION_DATA_EXPORT_META = [
//   { key:'partmaster.sku', header: 'SKU' },
//   {key: 'partmaster.partcategory.name', header: 'Category'},
//   {key: 'partmaster.unitofmeasure.name', header: 'Unit OfMeasure'},
//   {key: 'branch.name', header: 'Branch'},
//   {key: 'qoh', header: 'QOH'},
//   {key: 'rop', header: 'ROP'},
//   {key: 'maxlevel', header: 'Max Level'},
//   {key: 'partstatus.name', header: 'Status'},
// ]
//
//
