import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MessageComponent} from '../shared/component/message/message.component';
import {ConfirmComponent} from '../shared/component/confirm/confirm.component';
import {Observable} from 'rxjs';


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



}

interface ConfirmOptions {
  heading: string;
  message: string;
  width?: string;
}
