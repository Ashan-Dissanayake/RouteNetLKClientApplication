import {Component, Input, input} from '@angular/core';
import {MatFormField} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormField} from './formfieldata.model';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatDualListboxComponent} from '../component/dual-list-box/mat-dual-listbox.component';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'dynamic-field',
  template: `
    <ng-container [formGroup]="formInstance">
      <ng-container [ngSwitch]="field.type">
        <!-- Text -->
        <mat-form-field *ngSwitchCase="'text'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <input matInput [formControlName]="field.name" />
          <mat-error *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.</ng-container>
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('pattern')">Invalid format.</ng-container>
          </mat-error>
        </mat-form-field>

        <!-- Select -->
        <mat-form-field *ngSwitchCase="'select'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <mat-select [formControlName]="field.name">
            <mat-option *ngFor="let opt of field.options" [value]="opt">
              {{ opt.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.</ng-container>
          </mat-error>
        </mat-form-field>

        <!-- Date -->
        <mat-form-field *ngSwitchCase="'date'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <input matInput [matDatepicker]="picker"
                 [min]="field.dateConfig?.minDate"
                 [max]="field.dateConfig?.maxDate"
                 [formControlName]="field.name" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.</ng-container>
          </mat-error>
        </mat-form-field>

        <!-- Dual Listbox -->
        <mat-form-field *ngSwitchCase="'dualist'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <mat-dual-listbox
            [formControlName]="field.name"
            [sourceList]="field.options || []"
            displayProperty="name"
            [destinationObjectReference]="['id']">
          </mat-dual-listbox>
          <mat-error *ngIf="formInstance.get(field.name)?.hasError('required')">
            This field is required.
          </mat-error>
        </mat-form-field>
      </ng-container>
    </ng-container>
  `
  ,
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    NgIf,
    MatLabel,
    MatError,
    NgSwitch,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatDualListboxComponent,
    NgSwitchCase,
    MatSelect,
    NgForOf,
    MatOption
  ]

})
export class DynamicFieldComponent {
  @Input() formInstance!: FormGroup;
  @Input() field!: FormField;
}
