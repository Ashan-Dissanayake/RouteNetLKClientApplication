import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

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

  safeMessage!: SafeHtml;

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
    this.safeMessage = this.sanitizer.bypassSecurityTrustHtml(this.data.message);
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('custom-dialog');
  }

}
