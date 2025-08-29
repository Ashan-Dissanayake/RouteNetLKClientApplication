export interface FormField {
  name: string;
  type: FormFieldType;
  required: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  widget?: string;
  options?:{id:number,name:string}[];
  mode:FormFieldMode;
}

export type FormFieldType =
  | 'text' | 'number' | 'date' | 'file' | 'checkbox' | 'radio'
  | 'select' | 'autocomplete' | 'textarea' | 'password' | 'email'
  | 'tel' | 'currency' | 'toggle'
  | 'chips'|'dualist';


type FormFieldMode = 'regex' | 'options' | 'none';

