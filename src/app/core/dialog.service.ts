import {Injectable, TemplateRef} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MessageComponent} from '../shared/component/message/message.component';
import {ConfirmComponent} from '../shared/component/confirm/confirm.component';
import {Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {FormField} from '../shared/form/formfieldata.model';
import {FormpopupComponent} from '../shared/component/formpopup/formpopup.component';


@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: MatDialog) {}

  showMessage(options: DialogOptions):  Observable<boolean> {
     return  this.dialog.open(MessageComponent, {
        width: options.width || '500px',
        data: {heading: options.heading, message: options.message }
      }).afterClosed();
  }


  showConfirmation(options: DialogOptions): Observable<boolean> {
    return this.dialog.open(ConfirmComponent, {
      width: options.width || '500px',
      data: { heading: options.heading, message: options.message }
    }).afterClosed();
  }

  showFormPopup(options: FormPopupOptions): Observable<any> {
    const dialogRef = this.dialog.open(FormpopupComponent, {
      width: options.width || '800px',
      data: {
        form: options.form,
        meta: options.meta,
        heading: options.heading
      }
    });
    return dialogRef.afterClosed();
  }

}

interface DialogOptions {
  heading: string;
  message: string;
  width?: string;
}


export interface FormPopupOptions {
  heading: string;
  form: FormGroup;
  meta: FormField[];
  width?: string;
}
