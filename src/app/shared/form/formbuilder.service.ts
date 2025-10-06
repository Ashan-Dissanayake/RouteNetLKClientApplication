import { Injectable } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Regex} from '../models/regex.model';
import {FormField} from './formfieldata.model';


@Injectable({ providedIn: 'root' })
export class FormbuilderService {

  constructor(private fb: FormBuilder) {}

  build(fields: FormField[], dataMap: Record<string, any>): FormGroup {
    console.log("111")
    const group: Record<string, FormControl> = {};

    fields.forEach((field) => {
      const validators: ValidatorFn[] = [];
      if (field.required) validators.push(Validators.required);

      // Options dropdown
      if (field.mode === 'options' && dataMap[field.name]) {
        const optionsData: { id: number; name: string }[] = dataMap[field.name];
        field.options = optionsData.map(o => ({ id: o.id, name: o.name }));
      }

      // Regex fields
      if (field.mode === 'regex') {
        const regexRule = (dataMap['regexes'] as Regex)?.[field.name];
        if (regexRule) validators.push(Validators.pattern(regexRule.regex));
      }

      group[field.name] = new FormControl(
        { value: field.defaultValue ?? '', disabled: !!field.disabled },
        validators
      );

    });

    return this.fb.group(group,{updateOn:"change"});
  }

}




