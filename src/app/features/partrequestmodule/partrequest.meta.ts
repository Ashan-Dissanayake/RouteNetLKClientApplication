import {FormField} from '../../shared/models/formfieldata.model';
import {InnerTableColumn} from '../../shared/component/innertable/inner-table-column.model';

export const PART_REQUEST_TABLE_META = [
  {key: 'branch.name', label: 'Branch'},
  {key: 'number', label: 'Number'},
  {key: 'dorequested', label: 'Requested Date'},
  {key: 'remarks', label: 'Remarks'},
  {key: 'partrequeststatus.name', label: 'Status'},
  {key: 'actions', label: 'Actions'}
];

export const PART_REQUEST_FILTER_FORM_META: FormField[] = [
  {name: 'ssnumber', type: 'text', label: 'Number', required: false, mode: 'none'},
  {name: 'sspartrequeststatus', type: 'select', label: 'Status', required: false, mode: 'options'},
] as FormField[];


export const PART_REQUEST_LINE_META:FormField[] = [
  {name: 'part', type: 'select', label: 'Part', required: true, mode: 'options'},
  {name: 'quantity', type: 'text', label: 'Quantity', required: true, mode: 'none',},
];


export const PART_REQUEST_LINE_COLUMNS:InnerTableColumn[] = [
  { field: 'part.name', header: 'Part'    },
  { field: 'quantity',       header: 'Quantity'     },
];

export const PART_REQUEST_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Part id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'dorequested', type: 'date', label: 'Requested Date', required: true, mode: 'none',
    dateConfig:{ maxDate:new Date() }
  },
  {name: 'remakrs', type: 'text', label: 'Remarks', required: false, mode: 'regex'},
  {name: 'partrequestitems', type: 'inner-table', label: 'Request Items', required: true, mode: 'none',
    innerTableConfig: {
      columns: PART_REQUEST_LINE_COLUMNS,
      meta: PART_REQUEST_LINE_META,
      dataMap:{}
    }
  },
  {name: 'partrequeststatus', type: 'select', label: 'Part Request status', required: true, mode: 'options'},
] as FormField[];


export const PART_REQUEST_DATA_EXPORT_META = [
  {key: 'branch.name', header: 'Branch'},
  {key: 'number', header: 'Number'},
  {key: 'rop', header: 'ROP'},
  {key: 'maxlevel', header: 'Max Level'},
  {key: 'parreqesttstatus.name', header: 'Status'},
];

