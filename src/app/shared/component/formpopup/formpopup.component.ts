import {Component, Inject} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {DynamicFieldComponent} from '../../form/dynamic-field.component';
import {NgFor, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {FormField} from '../../form/formfieldata.model';
import {ButtonAction, ButtonPanelComponent} from '../button-panel/button-panel.component';

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
    @Inject(MAT_DIALOG_DATA) public data: { form: FormGroup; meta: FormField[]; heading: string }
  ) {}

  buttons: ButtonAction[] =[
    { label: 'Submit', type: 'create', icon: 'add' },
    { label: 'Cancel', type: 'cancel', icon: 'cancel',disabled:false }
  ];

  handleAction(actionType: string) {
    switch (actionType) {
      case 'create':  this.dialogRef.close(this.data.form.value);
        break;
      case 'cancel': this.dialogRef.close(); break;
    }
  }

}
