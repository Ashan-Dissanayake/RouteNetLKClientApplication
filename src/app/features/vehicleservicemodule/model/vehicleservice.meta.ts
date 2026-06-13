import {FormField} from '../../../shared/models/formfieldata.model';
import {InnerTableColumn} from '../../../shared/component/innertable/inner-table-column.model';

export const VEHICLE_SERVICE_TABLE_META = [
  {key: 'branch.name', label: 'Branch'},
  {key: 'number', label: 'Service Number'},
  {key: 'vehicle.number', label: 'Vehicle'},
  {key: 'vehicleservicetype.name', label: 'Service Type'},
  {key: 'vehicleservicepriority.name', label: 'Priority'},
  {key: 'incdent.name', label: 'Incident'},
  {key: 'vehicleservicestatus.name', label: 'Status'},
  {key: 'docreated', label: 'Created Date'},
  {key: 'actions', label: 'Actions'}
];

export const VEHICLE_SERVICE_FILTER_FORM_META: FormField[] = [
  {name: 'ssvehicle', type: 'select', label: 'Vehicle', required: false, mode: 'options',optionLabelKey:'number'},
  {name: 'ssdocreated', type: 'date', label: 'Created Date', required: false, mode: 'date'},
] as FormField[];

export const VEHICLE_SERVICE_LINE_META:FormField[] = [
  {name: 'part', type: 'select', label: 'Part', required: true, mode: 'options'},
  {name: 'quantity', type: 'text', label: 'Quantity', required: true, mode: 'none',},
] as FormField[]

export const VEHICLE_SERVICE_LINE_COLUMNS:InnerTableColumn[] = [
  { field: 'part.name',header: 'Part'},
  { field: 'quantity',header: 'Quantity'},
];

export const VEHICLE_SERVICE_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Vehicle service id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'vehicle', type: 'select', label: 'Vehicle', required: true, mode: 'options',optionLabelKey:'number'},
  {name: 'incdent', type: 'select', label: 'Incident', required: false, mode: 'options'},
  {name: 'vehicleserviceparts', type: 'inner-table', label: 'Parts', required: true, mode: 'none',
    innerTableConfig: {
      columns: VEHICLE_SERVICE_LINE_COLUMNS,
      meta: VEHICLE_SERVICE_LINE_META,
      dataMap:{}
    }
  },
  {name: 'vehicleservicetype', type: 'select', label: 'Service Type', required: true, mode: 'options'},
  {name: 'vehicleservicepriority', type: 'select', label: 'Priority', required: true, mode: 'options'},
  {name: 'vehicleservicestatus', type: 'select', label: 'Status', required: true, mode: 'options'},
] as FormField[];


export const VEHICLE_SERVICE_DATA_EXPORT_META = [
  { key: 'number', header: 'Service Number' },
  { key: 'vehicle.number', header: 'Vehicle' },
  {key: 'incident.name', header: 'Incident'},
  {key: 'vehicleservicestatus.name', header: 'Status'},
]


