import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-message',
  imports: [
    MatCardContent,
    MatCard,
    MatCardTitle,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './message.component.html',
  standalone: true,
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  lines?: [];

  constructor(public dialogRef: MatDialogRef<MessageComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.lines = this.data.message.split('<br>').filter((line: string) => line !== '');

  }

  ngOnInit(): void { this.dialogRef.addPanelClass('custom-dialog'); }

  onNoClick(): void { this.dialogRef.close(); }
}
