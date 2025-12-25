import { Injectable } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Regex} from '../shared/models/regex.model';
import {FormField} from '../shared/models/formfieldata.model';


@Injectable({ providedIn: 'root' })
export class FormbuilderService {

  constructor(private fb: FormBuilder) {}

  build(fields: FormField[], dataMap: Record<string, any>): FormGroup {
    const group: Record<string, AbstractControl> = {};

    fields.forEach((field) => {
      const validators: ValidatorFn[] = [];

      if (field.required) validators.push(Validators.required);

      if (field.mode === 'options' && dataMap[field.name]) {
        const optionsData: any[] = dataMap[field.name];
        field.options = optionsData.map(o => ({ id: o.id, ...o }));
      }

      // Regex fields
      if (field.mode === 'regex') {
        const regexRule = (dataMap['regexes'] as Regex)?.[field.name];
        if (regexRule) validators.push(Validators.pattern(regexRule.regex));
      }

      if (field.type === 'date-range') {
        group[field.name] = this.fb.group({
          start: new FormControl(null, field.required ? Validators.required : []),
          end: new FormControl(null, field.required ? Validators.required : []),
        });
        return;
      }

      group[field.name] = new FormControl(
        { value: field.defaultValue ?? '', disabled: !!field.disabled },
        validators
      );

    });

    return this.fb.group(group,{updateOn:"change"});
  }

}




