import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-confirm',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    NgForOf
  ],
  templateUrl: './confirm.component.html',
  standalone: true,
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent implements OnInit{

  lines?: [];

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.lines = this.data.message.split('<br>').filter((line: string) => line !== '');
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('custom-dialog');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
