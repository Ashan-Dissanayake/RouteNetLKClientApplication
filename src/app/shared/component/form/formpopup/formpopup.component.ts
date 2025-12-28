import {Component, Inject} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {DynamicFieldComponent} from '../dynamic-field.component';
import {NgFor, NgIf} from '@angular/common';
import {FormField} from '../../../models/formfieldata.model';
import {ButtonAction, ButtonClickEvent, ButtonPanelComponent} from '../../button/button-panel/button-panel.component';
import {DialogService} from '../../../../core/dialog.service';
import {FormbuilderService} from '../../../../core/formbuilder.service';

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

  isUpdate!:boolean;

  readonly  buttons: ButtonAction[] = [
    { label: 'Save', type: 'create', icon: 'add', disabled: false },
    { label: 'Cancel', type: 'cancel', icon: 'cancel', disabled: false }
  ];

  constructor(
    public dialogRef: MatDialogRef<FormpopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: FormGroup; meta: FormField[]; heading: string },
    private dialogService:DialogService,
    private formBuilderService:FormbuilderService
  ) {}


   private onSave(): void {
    const form = this.data.form;

    if (!form.valid) {
      const invalidControls = this.formBuilderService.getInvalidControls(form)
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

    this.isUpdate = !!form.get('id')?.value;

    if (this.isUpdate) {
      this.handleUpdate(form);
    } else {
      this.handleCreate(form);
    }
  }

  private onCancel():void {
    this.dialogRef.close();
    this.data.form.reset();
  }

  private handleCreate(form: FormGroup): void {
    this.dialogService.showConfirmation({
      heading:'Creating Branch',
      message: 'Do you want to create this branch?'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.dialogRef.close(form.getRawValue());
      }
    });
  }

  private handleUpdate(form: FormGroup): void {
    const heading = 'Updating Branch';
    const dirtyValues = this.formBuilderService.getUpdatedValues(form);
    const changedKeys = Object.keys(dirtyValues).filter(k => k !== 'id');

    if (changedKeys.length === 0) {
      this.dialogService.showMessage({
        heading: heading,
        message: `
        <p>No fields have been modified. There’s nothing to update.</p>
        <p>Please make some changes before submitting.</p>
      `
      });
      return;
    }

    const changeListHtml = changedKeys
      .map(key => `
      <li>
        <strong>${this.formBuilderService.formatLabel(key)}</strong>
      </li>
    `)
      .join('');

    const message = `
    <p>You are about to update the following field${changedKeys.length > 1 ? 's' : ''}:</p>
    <ul style="margin-top: 8px; margin-bottom: 8px;">${changeListHtml}</ul>
    <p>Do you want to proceed with these changes?</p>
  `;

    this.dialogService.showConfirmation({ heading, message })
      .subscribe(confirmed => {
        if (confirmed) {
          const submissionPayload = { ...form.getRawValue(), ...dirtyValues };
          this.dialogRef.close(submissionPayload);
        }
      });
  }

  private actionHandlers: Record<string, () => void> = {
    create: () => this.onSave(),
    cancel: () => this.onCancel()
  };

  handleAction(event: ButtonClickEvent | string) {
    const type = typeof event === 'string' ? event : event.type;
    const handler = this.actionHandlers[type];
    if (handler) handler();
    else this.dialogService.showWarning('Unhandled button action:', type);
  }

}
