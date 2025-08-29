import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MessageComponent} from '../shared/component/message/message.component';
import {ConfirmComponent} from '../shared/component/confirm/confirm.component';


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

  showConfirmation(heading: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      this.dialog.open(ConfirmComponent, {
        width: '500px',
        data: { heading, message }
      }).afterClosed().subscribe(result => resolve(result));
    });
  }
}
