import {Injectable, TemplateRef} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MessageComponent} from '../shared/component/message/message.component';
import {ConfirmComponent} from '../shared/component/confirm/confirm.component';
import {Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {FormField} from '../shared/models/formfieldata.model';
import {FormpopupComponent} from '../shared/component/form/formpopup/formpopup.component';
import {PrintTableComponent} from '../shared/component/print/print-table.component';
import {MatSnackBar} from '@angular/material/snack-bar';


@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(
    private dialog: MatDialog,
    private snackBar:MatSnackBar
  ) {}

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

  showPrintDialog(options: PrintDialogOptions): Observable<boolean> {
      const dialogRef = this.dialog.open(PrintTableComponent, {
        width: options.width || '900px',
        minHeight:'600px',
        data: {
          title: options.title,
          data: options.data,
          columns: options.columns || []
        }
      });
      return dialogRef.afterClosed();
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

  showSuccess(message: string, action = 'OK', duration = 2500) {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snackbar-success'],
      verticalPosition: 'top'
    });
  }

  showWarning(message: string, action = 'OK', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snackbar-warning'],
      verticalPosition: 'top'
    });
  }

  showError(message: string, action = 'Close', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snackbar-error'],
      verticalPosition: 'top'
    });
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

export interface PrintDialogOptions {
  title: string;
  mode: 'table';
  data: any;
  columns?: { key: string; header: string }[];
  width?: string;
}
