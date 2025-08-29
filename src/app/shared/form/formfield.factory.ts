import 'reflect-metadata';
import {FormField} from './formfieldata.model';



const FORM_FIELDS_KEY = Symbol('formFields');

export function Field(options: FormField) {
  return function (target: any, propertyKey: string) {
    const existingFields: FormField[] = Reflect.getMetadata(FORM_FIELDS_KEY, target) || [];
    existingFields.push({ ...options, name: propertyKey });
    Reflect.defineMetadata(FORM_FIELDS_KEY, existingFields, target);
  };
}

export function getFormFields(target: any): FormField[] {
  return Reflect.getMetadata(FORM_FIELDS_KEY, target) || [];
}
