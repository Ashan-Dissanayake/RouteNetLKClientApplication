import {Component,Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {PrintService} from '../../../core/print-service';
import {PrintDialogOptions} from '../../../core/dialog.service';
import {ButtonAction, ButtonClickEvent, ButtonPanelComponent} from '../button-panel/button-panel.component';


@Component({
  selector: 'app-print-table',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ButtonPanelComponent],
  templateUrl:'/print-table.component.html',
  styleUrl:'print-table.component.scss'
})
export class PrintTableComponent {

  buttons: ButtonAction[] = [
    { label: 'Print', type: 'print', icon: 'print', disabled: false },
    { label: 'Cancel', type: 'cancel', icon: 'cancel', disabled: false }
  ];

  constructor(
    public dialogRef: MatDialogRef<PrintTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrintDialogOptions,
    private printService: PrintService
  ) {}

  async print(): Promise<void> {
    try {
      await this.printService.generateStructuredPdf(
        this.data.title,
        this.data.columns,
        this.data.data,
        `${this.data.title}.pdf`
      );
      // Close the dialog and emit a value
      this.dialogRef.close(true);
    } catch (error) {
      this.dialogRef.close(false); // optional: indicate failure
    }
  }

  handleAction(event: ButtonClickEvent | string) {
    const type = typeof event === 'string' ? event : event.type;
    switch (type) {
      case 'print': this.print(); break;
      case 'cancel': this.dialogRef.close(); break;
      default:
        console.warn('Unhandled button action:', type);
    }
  }

  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : '';
    }, obj);
  }

}


