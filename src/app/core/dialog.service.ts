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

  showMessage(heading: string, message: string): Promise<void> {
    return new Promise(resolve => {
      this.dialog.open(MessageComponent, {
        width: '500px',
        data: { heading, message }
      }).afterClosed().subscribe(() => resolve());
    });
  }


  showConfirmation(options: ConfirmOptions): Observable<boolean> {
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

interface ConfirmOptions {
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
