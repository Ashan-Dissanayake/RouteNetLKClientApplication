import {FormField} from '../../../shared/models/formfieldata.model';

export const FARE_COLLECTION_TABLE_META = [
  {key: 'branch.name', label: 'Branch'},
  {key: 'tripexecution.name', label: 'Trip Execution'},
  {key: 'ticketmachine.name', label: 'Ticket Machine'},
  {key: 'totaltickets', label: 'Total Tickets'},
  {key: 'cachecollected', label: 'Cash Collected'},
  {key: 'digitalpayments', label: 'Digital Payments'},
  {key: 'isreconciled', label: 'Reconciled'},
  {key: 'tocollected', label: 'Collected Time'},
  {key: 'actions', label: 'Actions'}
];

export const FARE_COLLECTION_FILTER_FORM_META: FormField[] = [
  {name: 'sstripexecution', type: 'select', label: 'Trip Execution', required: false, mode: 'options'},
  {name: 'ssticketmachine', type: 'select', label: 'Ticket Machine', required: false, mode: 'options'},
] as FormField[];

export const FARE_COLLECTION_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Grn id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'tipexecution', type: 'select', label: 'Trip Execution', required: true, mode: 'options'},
  {name: 'ticketmachine', type: 'select', label: 'Ticket Machine', required: true, mode: 'options'},
  {name: 'totaltickets', type: 'number', label: 'Total Tickets', required: true, mode: 'none'},
  {name: 'cachecollected', type: 'number', label: 'Cache Collected', required: true, mode: 'none'},
  {name: 'digitalpayments', type: 'number', label: 'Digital Payment', required: true, mode: 'none'}
] as FormField[];

export const FARE_COLLECTION_DATA_EXPORT_META = [
  {key: 'branch.name', header: 'Branch'},
  {key: 'tipexecution.name', header: 'Trip Execution'},
  {key: 'totaltickets', header: 'Total Tickets'},
  {key: 'cachecollected', header: 'Cache Collected'},
  {key: 'digitalpayments', header: 'Digital Payment'},
  {key: 'isreconciled', header: 'Reconciled'},
];

