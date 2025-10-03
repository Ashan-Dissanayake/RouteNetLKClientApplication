import {Component, Inject} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {DynamicFieldComponent} from '../../form/dynamic-field.component';
import {NgFor, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {FormField} from '../../form/formfieldata.model';
import {ButtonAction, ButtonClickEvent, ButtonPanelComponent} from '../button-panel/button-panel.component';
import {DialogService} from '../../../core/dialog.service';

@Component({
  selector: 'app-formpopup',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    DynamicFieldComponent,
    NgFor,
    NgIf,
    ButtonPanelComponent
  ],
  templateUrl: './formpopup.component.html',
  standalone: true,
  styleUrl: './formpopup.component.scss'
})
export class FormpopupComponent {

  constructor(
    public dialogRef: MatDialogRef<FormpopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: FormGroup; meta: FormField[]; heading: string },
    private dialogService:DialogService
  ) {}

  buttons: ButtonAction[] = [
    { label: 'Save', type: 'create', icon: 'add', disabled: false },
    { label: 'Cancel', type: 'cancel', icon: 'cancel', disabled: false }
  ];

  handleAction(event: ButtonClickEvent | string) {
    const type = typeof event === 'string' ? event : event.type;
    switch (type) {
      case 'create': this.onSave(); break;
      case 'cancel': this.dialogRef.close(); break;
      default:
        console.warn('Unhandled button action:', type);
    }
  }

  private onSave(): void {
    const form = this.data.form;

    if (!form.valid) {
      const invalidControls = this.getInvalidControls(form);
      const errorList = invalidControls.map(ctrl => `<li>${ctrl}</li>`).join('');

      this.dialogService.showMessage({
        heading: 'Validation Error',
        message: `
        <p>You have errors in the following fields:</p>
        <ul>${errorList}</ul>
      `
      });
      return;
    }

    const isUpdate = !!form.get('id')?.value;

    if (isUpdate) {
      this.handleUpdate(form);
    } else {
      this.handleCreate(form);
    }
  }

  private handleUpdate(form: FormGroup): void {
    const heading = 'Updating Branch';

    const dirtyValues = this.getUpdatedValues(form);

    const changeList = Object.keys(dirtyValues)
      .filter(k => k !== 'id')
      .map(k => `<li><strong>${k}</strong> → ${dirtyValues[k]}</li>`)
      .join('');

    this.dialogService.showConfirmation({
      heading,
      message: `
      <p>You are about to update the following fields:</p>
      <ul>${changeList || '<li>No fields changed</li>'}</ul>
      <p>Do you want to proceed?</p>
    `
    }).subscribe(confirmed => {
      if (confirmed) {
        const submissionPayload = { ...form.value, ...dirtyValues };
        this.dialogRef.close(submissionPayload);
      }
    });
  }

  private handleCreate(form: FormGroup): void {
    const heading = 'Creating Branch';
    this.dialogService.showConfirmation({
      heading,
      message: 'Do you want to create this branch?'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.dialogRef.close(form.value);
      }
    });
  }

  private getInvalidControls(form: FormGroup): string[] {
    const invalidControls: string[] = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push(name);
      }
    }
    return invalidControls;
  }


  private getUpdatedValues(form: FormGroup): Partial<any> {
    const updatedValues: Partial<any> = {};
    const controls = form.controls;

    for (const name in controls) {
      if (controls.hasOwnProperty(name)) {
        const control = controls[name];
        if (control.dirty) {
          updatedValues[name] = control.value;
        }
      }
    }

    const idControl = form.get('id');
    if (idControl && idControl.value) {
      updatedValues['id'] = idControl.value;
    }

    return updatedValues;
  }

}
