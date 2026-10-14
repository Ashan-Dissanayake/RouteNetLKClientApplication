import { Injectable } from "@angular/core";
import {DialogService} from './dialog.service';
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {

  constructor(
    private dialogService: DialogService
  ) {}

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
        message: `
          <p>Please correct the following fields:</p>
          <ul>${errorList}</ul>
        `
      });

      return;
    }

    // 2. Determine create/update
    const isUpdate = !!form.get('id')?.value;

    if (isUpdate) {
      this.handleUpdateFlow(
        form,
        entityName,
        onExecute
      );
    } else {
      this.handleCreateFlow(
        form,
        entityName,
        onExecute
      );
    }
  }

  private handleCreateFlow(
    form: FormGroup,
    entityName: string,
    onExecute: (payload: any) => void
  ): void {

    this.dialogService.showConfirmation({
      heading: `Create ${entityName}`,
      message: `
        Are you sure you want to create
        this ${entityName.toLowerCase()}?
      `
    }).subscribe(confirmed => {

      if (confirmed) {
        onExecute(form.getRawValue());
      }

    });
  }

  private handleUpdateFlow(
    form: FormGroup,
    entityName: string,
    onExecute: (payload: any) => void
  ): void {

    const dirtyValues = this.getUpdatedValues(form);

    const changedKeys = Object.keys(dirtyValues)
      .filter(key => key !== 'id');

    if (changedKeys.length === 0) {

      this.dialogService.showMessage({
        heading: 'No Changes',
        message: `
          No fields have been modified.
          There is nothing to update.
        `
      });

      return;
    }

    const changeListHtml = changedKeys
      .map(
        key => `<li><strong>${this.formatLabel(key)}</strong></li>`
      )
      .join('');

    this.dialogService.showConfirmation({
      heading: `Update ${entityName}`,
      message: `
        <p>You are updating the following fields:</p>

        <ul style="margin: 10px 0;">
          ${changeListHtml}
        </ul>

        <p>Do you want to proceed?</p>
      `
    }).subscribe(confirmed => {

      if (confirmed) {

        const payload = {
          ...form.getRawValue(),
          ...dirtyValues
        };

        onExecute(payload);
      }

    });
  }

  private getInvalidControls(form: FormGroup): string[] {
    const invalid: string[] = [];

    const recursiveCheck = (group: FormGroup | any, prefix = '') => {
      Object.keys(group.controls).forEach(key => {
        const control = group.get(key);
        const label = prefix ? `${prefix}.${key}` : key;

        if (control.invalid) {
          if (control instanceof FormGroup) {
            recursiveCheck(control, label);
          } else {
            invalid.push(label);
          }
        }
      });
    };

    recursiveCheck(form);

    if (form.errors) {
      Object.keys(form.errors).forEach(key => {
        invalid.push(`Form Error: ${key}`);
      });
    }

    return invalid;
  }

  private getUpdatedValues(
    form: FormGroup
  ): Record<string, any> {

    return Object.entries(form.controls)
      .filter(([_, control]) => control.dirty)
      .reduce(
        (acc, [key, control]) => ({
          ...acc,
          [key]: control.value
        }),
        {}
      );
  }

  private formatLabel(field: string): string {
    if (field.startsWith('Form Error: ')) {
      return field;
    }

    return field
      .split('.')
      .map(part =>
        part
          .replace(/[_\-]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/\b\w/g, c => c.toUpperCase())
      )
      .join(' -> ');
  }
}
