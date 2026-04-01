import {FormField} from '../../shared/models/formfieldata.model';

export const PART_TABLE_META = [
  {key: 'branch.name', label: 'Branch'},
  {key: 'partmaster.partcategory.name', label: 'Category'},
  {key: 'partmaster.sku', label: 'SKU'},
  {key: 'partmaster.name', label: 'Name'},
  {key: 'remarks', label: 'Remarks'},
  {key: 'qoh', label: 'QOH'},
  {key: 'maxlevel', label: 'Max Level'},
  {key: 'partmaster.unitofmeasure.name', label: 'UOM'},
  {key: 'rop', label: 'ROP'},
  {key: 'partstatus.name', label: 'Part Status'},
  {key: 'dolastordered', label: 'Last Ordered Date'},
  {key: 'actions', label: 'Actions'}
];

export const PART_FILTER_FORM_META: FormField[] = [
  {name: 'sscategory', type: 'select', label: 'Category', required: false, mode: 'options'},
  {name: 'sspartstatus', type: 'select', label: 'Status', required: false, mode: 'options'},
] as FormField[];

export const PART_MAIN_FORM_META: FormField[] = [
  {name: 'id', type: 'hidden', label: 'Part id', required: false, mode: 'none'},
  {name: 'branch', type: 'select', label: 'Branch', required: true, mode: 'options'},
  {name: 'partmaster', type: 'select', label: 'Part Master', required: true, mode: 'options'},
  {name: 'qoh', type: 'text', label: 'QOH', required: true, mode: 'none'},
  {name: 'maxlevel', type: 'text', label: 'Max Level', required: true, mode: 'none'},
  {name: 'rop', type: 'text', label: 'ROP', required: true, mode: 'none'},
  {name: 'dolastordered', type: 'date', label: 'Last Ordered', required: false, mode: 'none',
    dateConfig:{ maxDate:new Date() }
  },
  {name: 'remakrs', type: 'text', label: 'Remarks', required: false, mode: 'regex'},
  {name: 'partstatus', type: 'select', label: 'Status', required: true, mode: 'options'},
] as FormField[];

export const PART_IMMUTABLE_CONTROLLERS_META = [
  'branch', 'qoh','dolastordered','partmaster'
]

export const PART_DATA_EXPORT_META = [
  { key: 'partmaster.sku', header: 'SKU' },
  {key: 'partmaster.partcategory.name', header: 'Category'},
  {key: 'partmaster.unitofmeasure.name', header: 'Unit OfMeasure'},
  {key: 'branch.name', header: 'Branch'},
  {key: 'qoh', header: 'QOH'},
  {key: 'rop', header: 'ROP'},
  {key: 'maxlevel', header: 'Max Level'},
  {key: 'partstatus.name', header: 'Status'},
]


