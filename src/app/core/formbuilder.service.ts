import { Injectable } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Regex} from '../shared/models/regex.model';
import {FormField} from '../shared/models/formfieldata.model';
import {DialogService} from './dialog.service';


@Injectable({ providedIn: 'root' })
export class FormbuilderService {

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService
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
        { value: field.defaultValue ?? field.defaultValue, disabled: !!field.disabled },
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

  handleSave(
    form: FormGroup,
    entityName: string,
    onExecute: (payload: any) => void
  ): void {
    // 1. Validate
    if (form.invalid) {
      const invalidControls = this.getInvalidControls(form);
      const errorList = invalidControls
        .map(ctrl => `<li>${this.formatLabel(ctrl)}</li>`)
        .join('');

      this.dialogService.showMessage({
        heading: 'Validation Error',
        message: `<p>Please correct the following fields:</p><ul>${errorList}</ul>`
      });
      return;
    }

    const isUpdate = !!form.get('id')?.value;

    if (isUpdate) {
      this.handleUpdateFlow(form, entityName, onExecute);
    } else {
      this.handleCreateFlow(form, entityName, onExecute);
    }
  }

  private handleCreateFlow(form: FormGroup, entity: string, onExecute: any): void {
    this.dialogService.showConfirmation({
      heading: `Create ${entity}`,
      message: `Are you sure you want to create this ${entity.toLowerCase()}?`
    }).subscribe(confirmed => {
      if (confirmed) onExecute(form.getRawValue());
    });
  }

  private handleUpdateFlow(form: FormGroup, entity: string, onExecute: any): void {
    const dirtyValues = this.getUpdatedValues(form);
    const changedKeys = Object.keys(dirtyValues).filter(k => k !== 'id');

    if (changedKeys.length === 0) {
      this.dialogService.showMessage({
        heading: 'No Changes',
        message: 'No fields have been modified. There is nothing to update.'
      });
      return;
    }

    const changeListHtml = changedKeys
      .map(key => `<li><strong>${this.formatLabel(key)}</strong></li>`)
      .join('');

    this.dialogService.showConfirmation({
      heading: `Update ${entity}`,
      message: `
        <p>You are updating the following fields:</p>
        <ul style="margin: 10px 0;">${changeListHtml}</ul>
        <p>Do you want to proceed?</p>
      `
    }).subscribe(confirmed => {
      if (confirmed) {
        // Merge raw values with dirty values to ensure all context is sent
        const payload = { ...form.getRawValue(), ...dirtyValues };
        onExecute(payload);
      }
    });
  }




}

type NormalizationRule = {
  from: string; // path to extract, e.g., 'seatingcapacity.make'
  to: string;   // new key, e.g., 'make'
  remove?: boolean; // whether to remove the original key
};



