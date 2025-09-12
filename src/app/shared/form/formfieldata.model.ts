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
}

type OptionsField = {id:number,name:string}


export  type FieldType =
  | 'text' | 'number' | 'date' | 'file' | 'checkbox' | 'radio'
  | 'select' | 'autocomplete' | 'textarea' | 'password' | 'email'
  | 'tel' | 'currency' | 'toggle'
  | 'chips'|'dualist';


type FieldMode = 'regex' | 'options' | 'none'|'date';

// ----------------For Search Fields--------------------

interface FilterOption {
  id: number;
  name: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'input' | 'select';
  placeholder?: string;
  value?: any;
  options?: FilterOption[];
  required?: boolean;
  disabled?: boolean;
}
