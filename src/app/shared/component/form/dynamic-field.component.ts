import {Component, Input} from '@angular/core';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormField} from '../../models/formfieldata.model';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatDualListboxComponent} from '../dual-list-box/mat-dual-listbox.component';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatNativeDateModule} from '@angular/material/core';
import {FilePickerComponent} from '../file-picker/file-picker.component';

@Component({
  selector: 'dynamic-field',
  template: `
    <ng-container [formGroup]="formInstance">
      <ng-container [ngSwitch]="field.type">

        <input *ngSwitchCase="'hidden'"
               type="hidden"
               [formControlName]="field.name" />

        <!-- Text -->
        <mat-form-field *ngSwitchCase="'text'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <input matInput [formControlName]="field.name"  />
          <mat-error *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.</ng-container>
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('pattern')">Invalid format.</ng-container>
          </mat-error>
        </mat-form-field>

        <!-- File -->
        <mat-form-field *ngSwitchCase="'file'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <app-file-picker [formControlName]="field.name"></app-file-picker>
          <mat-error *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.</ng-container>
          </mat-error>
        </mat-form-field>

        <!-- Number -->
        <mat-form-field *ngSwitchCase="'number'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <input matInput
                 type="number"
                 [min]="1900"
                 [max]="currentYear"
                 step="1"
                 [formControlName]="field.name"  />
          <mat-error *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">
              This field is required.
            </ng-container>
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('min') || formInstance.get(field.name)?.hasError('max')">
              Enter a valid year between 1900 and {{ currentYear }}.
            </ng-container>
          </mat-error>
        </mat-form-field>


        <!-- Select -->
        <mat-form-field *ngSwitchCase="'select'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <mat-select [formControlName]="field.name" [compareWith]="compareFn">
            <mat-option *ngFor="let opt of field.options" [value]="opt">
              {{ opt[field.optionLabelKey || 'name']}}
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
            [destinationObjectReference]="field.referencePath || []" >
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
    MatFormFieldModule,
    MatInput,
    ReactiveFormsModule,
    NgIf,
    MatLabel,
    MatError,
    NgSwitch,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatNativeDateModule,
    MatDatepicker,
    MatDatepickerModule,
    MatDualListboxComponent,
    NgSwitchCase,
    MatSelect,
    NgForOf,
    MatOption,
    FormsModule,
    FilePickerComponent,
  ]
})
export class DynamicFieldComponent {

  @Input() formInstance!: FormGroup;
  @Input() field!: FormField;

  compareFn(o1: any | null, o2: any | null): boolean {
    if (!o1 || !o2) {
      return o1 === o2;
    }
    return o1.id === o2.id;
  }

  currentYear = new Date().getFullYear();


}

