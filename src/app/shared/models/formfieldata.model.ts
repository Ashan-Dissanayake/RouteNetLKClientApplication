import {InnerTableColumn} from '../component/innertable/inner-table-column.model';

export type DateConfig = {
    minDate?: Date;
    maxDate?: Date;
    range?: { years:number,months:number,days:number};
};

export type TimeConfig = {
  minTime?: string | null;
  maxTime?: string | null;
};

export type OptionsField<T = unknown> = {
    id: number;
} & Record<string, T>;

export type FieldType =
    | 'text'
    | 'number'
    | 'date'
    | 'file'
    | 'time-range'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'autocomplete'
    | 'textarea'
    | 'password'
    | 'email'
    | 'tel'
    | 'currency'
    | 'toggle'
    | 'year'
    | 'chips'
    | 'date-range'
    | 'dualist'
    | 'inner-table';

export type FieldMode = 'regex' | 'options' | 'none' | 'date';

export interface FormField<TValue = unknown, TReference = unknown, TOption = unknown> {
    name: string;
    type: FieldType;
    required: boolean;

    label?: string;
    placeholder?: string;
    disabled?: boolean;

    options?: Array<OptionsField<TOption>>;
    optionLabelKey?: string;

    mode: FieldMode;
    dateConfig?: DateConfig;
    timeConfig?: TimeConfig;

    defaultValue?: TValue;
    referenceName?: TReference;
    referencePath?: string[];

  innerTableConfig?: {
    columns: InnerTableColumn[];
    meta: FormField[];
    dataMap: Record<string, any>;
  };
}
