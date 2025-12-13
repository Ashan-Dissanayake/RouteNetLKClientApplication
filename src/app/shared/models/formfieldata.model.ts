export interface FormField {
  name: string;
  type: FieldType;
  required: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  options?:OptionsField[];
  optionLabelKey?: string;
  mode:FieldMode;
  dateConfig?: {
    minDate?: Date;
    maxDate?: Date;
  };
  defaultValue:any;
  referenceName:any;
  referencePath?:string[];
}

// export type OptionsField = {
//   id: number;
//   name: string;
// };


// export type OptionsField<T = any> = {
//   id: number;
//   [key: string]: T;
// };

export type OptionsField<T = any> = {
  id: number;
} & Record<string, T>;


export  type FieldType =
  | 'text' | 'number' | 'date' | 'file' | 'checkbox' | 'radio'
  | 'select' | 'autocomplete' | 'textarea' | 'password' | 'email'
  | 'tel' | 'currency' | 'toggle'|'year'
  | 'chips'|'dualist';

type FieldMode = 'regex' | 'options' | 'none'|'date';
