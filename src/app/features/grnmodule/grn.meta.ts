import {FormField} from '../../shared/models/formfieldata.model';
import {InnerTableColumn} from '../../shared/component/innertable/inner-table-column.model';

export const GRN_TABLE_META = [
  {key: 'branch.name', label: 'Branch'},
  {key: 'number', label: 'GRN Number'},
  {key: 'doreceived', label: 'Received Date'},
  {key: 'remarks', label: 'Remarks'},
  {key: 'grnstatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

export const GRN_FILTER_FORM_META: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Number', required: false, mode: 'none'},
  {name: 'sspartrequest', type: 'select', label: 'Request', required: false, mode: 'options',optionLabelKey:'number'},
  {name: 'ssgrnstatus', type: 'select', label: 'Status', required: false, mode: 'options'},
] as FormField[];


export const GRN_LINE_META:FormField[] = [
  {name: 'partrequestitem.part.name', type: 'text', label: 'Part', required: true, mode: 'none'},
  {name: 'quantity', type: 'text', label: 'Quantity', required: true, mode: 'none',},
] as FormField[]

export const GRN_LINE_COLUMNS:InnerTableColumn[] = [
  { field: 'partrequestitem.part.name',header: 'Part'},
  { field: 'quantity',header: 'Quantity'},
];

export const GRN_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Grn id', required: false, mode: 'none'},
  // {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'doreceived', type: 'date', label: 'Received Date', required: true, mode: 'none',
    dateConfig:{ maxDate:new Date() }
  },
  {name: 'remakrs', type: 'text', label: 'Remarks', required: false, mode: 'regex'},
  {name: 'grnpartrequestitems', type: 'inner-table', label: 'GRN Items', required: true, mode: 'none',
    innerTableConfig: {
      columns: GRN_LINE_COLUMNS,
      meta: GRN_LINE_META,
      dataMap:{}
    }
  },
  // {name: 'grnststatus', type: 'select', label: 'Grn status', required: true, mode: 'options'},
] as FormField[];


export const GRN_DATA_EXPORT_META = [
  {key: 'branch.name', header: 'Branch'},
  {key: 'number', header: 'Number'},
  {key: 'doreceived', header: 'Received Date'},
  {key: 'grnstatus.name', header: 'Status'},
];

