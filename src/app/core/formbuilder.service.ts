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
        { value: field.defaultValue ?? '', disabled: !!field.disabled },
        validators
      );

    });

    return this.fb.group(group,{updateOn:"change"});
  }

  // Helpers
  getInvalidControls(form: FormGroup): string[] {
    return Object.keys(form.controls).filter(key => form.get(key)?.invalid);
  }

  getUpdatedValues(form: FormGroup): Record<string, any> {
    return Object.entries(form.controls)
      .filter(([_, ctrl]) => ctrl.dirty)
      .reduce((acc, [key, ctrl]) => ({ ...acc, [key]: ctrl.value }), {});
  }

  formatLabel(field: string): string {
    return field
      .replace(/[_\-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  resetForm(form: FormGroup): void {
    form.reset();
    Object.values(form.controls).forEach(ctrl => ctrl.markAsPristine());
  }

  setControlsState(form: FormGroup, controls: string[], disabled: boolean) {
    controls.forEach(c => form.get(c)?.[disabled ? 'disable' : 'enable']());
  }

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



