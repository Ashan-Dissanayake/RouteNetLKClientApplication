export interface FormField {
  name: string;
  type: FieldType;
  required: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  options?:OptionsField[];
  mode:FieldMode;
  dateConfig?: {
    minDate?: Date;
    maxDate?: Date;
  };
  referencePath?:string[];
}

type OptionsField = {id:number,name:string}


export  type FieldType =
  | 'text' | 'number' | 'date' | 'file' | 'checkbox' | 'radio'
  | 'select' | 'autocomplete' | 'textarea' | 'password' | 'email'
  | 'tel' | 'currency' | 'toggle'
  | 'chips'|'dualist';


type FieldMode = 'regex' | 'options' | 'none'|'date';
