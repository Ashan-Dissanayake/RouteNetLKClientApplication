import { Injectable } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Regex} from '../shared/models/regex.model';
import {FormField} from '../shared/models/formfieldata.model';


@Injectable({ providedIn: 'root' })
export class FormbuilderService {

  constructor(private fb: FormBuilder) {}

  build(fields: FormField[], dataMap: Record<string, any>): FormGroup {
    const group: Record<string, FormControl> = {};

    fields.forEach((field) => {
      const validators: ValidatorFn[] = [];
      if (field.required) validators.push(Validators.required);

      // Options dropdown
      // if (field.mode === 'options' && dataMap[field.name]) {
      //   const optionsData: any[] = dataMap[field.name];
      //   field.options = optionsData.map(o => ({...o}));
      //   if (field.name=="seatingcapacity"){
      //     console.log(field.options)
      //   }
      // }

      if (field.mode === 'options' && dataMap[field.name]) {
        const optionsData: any[] = dataMap[field.name];
        field.options = optionsData.map(o => ({ id: o.id, ...o }));

        if (field.name=="seatingcapacity"){
              console.log(field.options)
        }
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




