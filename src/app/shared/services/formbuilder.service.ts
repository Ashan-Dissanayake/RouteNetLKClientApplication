import { Injectable } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Regex} from '../models/regex.model';
import {FormField} from '../models/formfieldata.model';
import {DialogService} from './dialog.service';


@Injectable({ providedIn: 'root' })
export class FormbuilderService {

  constructor(
    private fb: FormBuilder,
  ) {}

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

      if (field.type === 'inner-table') {
        group[field.name] = new FormControl(
          { value: field.defaultValue ?? [], disabled: !!field.disabled },
          field.required ? [FormbuilderService.nonEmptyArray()] : []
        );
        return;
      }

      if (field.type === 'date-range') {
        group[field.name] = this.fb.group({
          start: new FormControl(null, field.required ? Validators.required : []),
          end: new FormControl(null, field.required ? Validators.required : []),
        });
        return;
      }

      group[field.name] = new FormControl(
        {
          value: field.defaultValue,
          disabled: !!field.disabled
        },
        validators
      );
    });

    return this.fb.group(group, { updateOn: 'change' });
  }

  resetForm(form: FormGroup): void {
    form.reset();
    Object.values(form.controls).forEach(ctrl => ctrl.markAsPristine());
  }

  setControlsState(form: FormGroup, controls: string[], disabled: boolean) {
    controls.forEach(c => form.get(c)?.[disabled ? 'disable' : 'enable']());
  }

  // Temporary: used for legacy/nested entity-to-form mapping.
  // Replace it with a domain-specific mapper when the form model is separated.
  mapNestedValues(obj: any, rules: NormalizationRule[]) {
    const result = { ...obj };

    rules.forEach(rule => {
      const fromKeys = rule.from.split('.');
      let value = result;

      // Traverse to get the value
      for (const key of fromKeys) {
        value = value?.[key];
        if (value === undefined) break;
      }

      // Assign to new key
      result[rule.to] = value ?? null;

      // Remove original top-level key if requested
      if (rule.remove) {
        delete result[fromKeys[0]];
      }
    });

    return result;
  }

  //for dynamic meta data handling
  updateOptions(fields: FormField[], form: FormGroup, fieldName: string, newOptions: any[]): void {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    field.options = newOptions.map(o => ({ id: o.id, ...o }));

    form.get(fieldName)?.reset();
    form.get(fieldName)?.markAsPristine();
  }

  static nonEmptyArray(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!Array.isArray(value) || value.length === 0) {
        return { required: true };
      }
      return null;
    };
  }

}

type NormalizationRule = {
  from: string; // path to extract, e.g., 'seatingcapacity.make'
  to: string;   // new key, e.g., 'make'
  remove?: boolean; // whether to remove the original key
};



