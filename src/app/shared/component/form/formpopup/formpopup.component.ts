import {Component, Inject} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {DynamicFieldComponent} from '../dynamic-field.component';
import {NgFor, NgIf} from '@angular/common';
import {FormField} from '../../../models/formfieldata.model';
import {ButtonAction, ButtonClickEvent, ButtonPanelComponent} from '../../button/button-panel/button-panel.component';
import {DialogService} from '../../../services/dialog.service';
import {FormbuilderService} from '../../../services/formbuilder.service';
import {FormSubmissionService} from '../../../services/formsubmission.service';

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

  readonly  buttons: ButtonAction[] = [
    { label: 'Save', type: 'create', icon: 'add', disabled: false },
    { label: 'Cancel', type: 'cancel', icon: 'cancel', disabled: false }
  ];

  constructor(
    public dialogRef: MatDialogRef<FormpopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      form: FormGroup;
      meta: FormField[];
      heading: string;
    },
    private formSubmissionService: FormSubmissionService
  ) {}

  private onSave(): void {
    this.formSubmissionService.handleSave(
      this.data.form,
      this.data.heading,
      (payload) => {
        // If the service confirms everything is okay, we close the dialog with the data
        this.dialogRef.close(payload);
      }
    );
  }

  //not belongs to here.latter will change
  private onCancel(): void {
    this.data.form.reset();
    this.dialogRef.close();
  }


  handleAction(event: ButtonClickEvent | string) {
    const type = typeof event === 'string' ? event : event.type;

    if (type === 'save' || type === 'create') {
      this.onSave();
    } else if (type === 'cancel') {
      this.onCancel();
    }
  }


}
