import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {FormField} from '../shared/models/formfieldata.model';
import {MessageComponent} from '../shared/component/message/message.component';
import {ConfirmComponent} from '../shared/component/confirm/confirm.component';
import {FormpopupComponent} from '../shared/component/form/formpopup/formpopup.component';
import {PrintTableComponent} from '../shared/component/export/print/print-table.component';
import {getErrorMessage} from './error.util';
import {ComponentType} from '@angular/cdk/portal';

const DEFAULT_CONFIG = {
    DIALOG_WIDTH: '500px',
    FORM_DIALOG_WIDTH: '800px',
    SNACKBAR_DURATION: 3000,
    SNACKBAR_POSITION: 'top' as const
};

@Injectable({providedIn: 'root'})
export class DialogService {
    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
    }

    // --- Dialog Methods ---

    showMessage(options: DialogOptions): Observable<boolean> {
        return this.dialog.open(MessageComponent, {
            width: options.width || DEFAULT_CONFIG.DIALOG_WIDTH,
            data: {heading: options.heading, message: options.message}
        }).afterClosed();
    }

    showConfirmation(options: DialogOptions): Observable<boolean> {
        return this.dialog.open(ConfirmComponent, {
            width: options.width || DEFAULT_CONFIG.DIALOG_WIDTH,
            data: {heading: options.heading, message: options.message}
        }).afterClosed();
    }

    showPrintDialog(options: PrintDialogOptions): Observable<boolean> {
        return this.dialog.open(PrintTableComponent, {
            maxHeight: options.height,
            maxWidth: options.width,
            data: {
                title: options.title,
                data: options.data,
                columns: options.columns || []
            }
        }).afterClosed();
    }

    showFormPopup(options: FormPopupOptions): Observable<any> {
        return this.dialog.open(FormpopupComponent, {
            width: options.width || DEFAULT_CONFIG.FORM_DIALOG_WIDTH,
            data: {
                form: options.form,
                meta: options.meta,
                heading: options.heading
            }
        }).afterClosed();
    }

    // --- SnackBar Methods ---
    showSuccess(message: string, action = 'OK', duration = 2500) {
        this.showSnackBar(message, action, {duration, panelClass: ['snackbar-success']});
    }

    showWarning(message: string, action = 'OK', duration = DEFAULT_CONFIG.SNACKBAR_DURATION):any {
       return  this.showSnackBar(message, action, {duration, panelClass: ['snackbar-warning']});
    }

    showError(message: string, action = 'Close', duration = DEFAULT_CONFIG.SNACKBAR_DURATION) {
        this.showSnackBar(message, action, {duration, panelClass: ['snackbar-error']});
    }

    showErrorMessage(heading: string, err: any) {
        this.showMessage({
            heading,
            message: getErrorMessage(err)
        });
    }

    private showSnackBar(message: string, action: string, config: MatSnackBarConfig) {
        this.snackBar.open(message, action, {
            verticalPosition: DEFAULT_CONFIG.SNACKBAR_POSITION,
            ...config
        });
    }

  showComponent<T>(
    component: ComponentType<T>, data?: any, width = DEFAULT_CONFIG.FORM_DIALOG_WIDTH): MatDialogRef<T>
  {
    return this.dialog.open(component, {
      width,
      data
    });
  }
}

export interface DialogOptions {
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
    height?: string;
}
