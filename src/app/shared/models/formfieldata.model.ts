export type DateConfig = {
    minDate?: Date;
    maxDate?: Date;
};

export type OptionsField<T = unknown> = {
    id: number;
} & Record<string, T>;

export type FieldType =
    | 'text'
    | 'number'
    | 'date'
    | 'file'
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
    | 'dualist';

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

    defaultValue: TValue;
    referenceName: TReference;
    referencePath?: string[];
}
