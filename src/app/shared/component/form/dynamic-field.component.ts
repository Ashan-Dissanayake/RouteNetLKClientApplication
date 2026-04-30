import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormField} from '../../models/formfieldata.model';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {
  MatDatepicker,
  MatDatepickerInput, MatDatepickerInputEvent,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatDualListboxComponent} from '../dual-list-box/mat-dual-listbox.component';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatNativeDateModule} from '@angular/material/core';
import {FilePickerComponent} from '../file-picker/file-picker.component';
import {DataTableComponent} from '../data-table/data-table.component';
import {InnerableComponent} from '../innertable/innertable.component';
import {
  MatTimepicker,
  MatTimepickerInput,
  MatTimepickerToggle
} from '@angular/material/timepicker';

@Component({
  selector: 'dynamic-field',
  template: `
    <ng-container [formGroup]="formInstance">
      <ng-container [ngSwitch]="field.type">

        <input *ngSwitchCase="'hidden'"
               type="hidden"
               [formControlName]="field.name"/>

        <!-- Text -->
        <mat-form-field *ngSwitchCase="'text'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <input matInput [formControlName]="field.name"/>
          <mat-error
            *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.
            </ng-container>
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('pattern')">Invalid format.</ng-container>
          </mat-error>
        </mat-form-field>

        <!-- File -->
        <mat-form-field *ngSwitchCase="'file'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <app-file-picker [formControlName]="field.name"></app-file-picker>
          <mat-error
            *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.
            </ng-container>
          </mat-error>
        </mat-form-field>

        <!-- Number -->
        <mat-form-field *ngSwitchCase="'number'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <input matInput
                 type="number"
                 step="1"
                 [formControlName]="field.name"/>
          <mat-error
            *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">
              This field is required.
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
          <mat-error
            *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.
            </ng-container>
          </mat-error>
        </mat-form-field>

        <!-- Date -->
        <mat-form-field *ngSwitchCase="'date'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <input matInput [matDatepicker]="picker"
                 [min]="field.dateConfig?.minDate"
                 [max]="field.dateConfig?.maxDate"
                 [formControlName]="field.name"/>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error
            *ngIf="formInstance.get(field.name)?.invalid && (formInstance.get(field.name)?.dirty || formInstance.get(field.name)?.touched)">
            <ng-container *ngIf="formInstance.get(field.name)?.hasError('required')">This field is required.
            </ng-container>
          </mat-error>
        </mat-form-field>

        <!--Date Range-->
        <mat-form-field *ngSwitchCase="'date-range'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>

          <mat-date-range-input
            [formGroup]="$any(formInstance.get(field.name))"
            [rangePicker]="picker">

            <input matStartDate formControlName="start" placeholder="Start date"
                   (dateChange)="onStartDateChange($event, $any(field.dateConfig?.range), field.name)">
            <input matEndDate formControlName="end" placeholder="End date">

          </mat-date-range-input>

          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>

          <mat-error *ngIf="formInstance.get(field.name)?.invalid">
            This field is required
          </mat-error>
        </mat-form-field>

        <!--Time Pciker-->
        <mat-form-field *ngSwitchCase="'time-range'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <mat-timepicker #timePicker></mat-timepicker>

          <mat-timepicker-toggle
            *ngIf="timePicker"
            matSuffix
            [for]="timePicker">
          </mat-timepicker-toggle>

          <input
            matInput
            [formControlName]="field.name"
            [matTimepicker]="timePicker"
            [matTimepickerMin]="field.timeConfig?.minTime ?? null"
            [matTimepickerMax]="field.timeConfig?.maxTime ?? null"
          >

          <mat-error
            *ngIf="formInstance.get(field.name)?.invalid && formInstance.get(field.name)?.touched">
            <ng-container
              *ngIf="formInstance.get(field.name)?.hasError('required')">
              This field is required.
            </ng-container>
          </mat-error>
        </mat-form-field>

        <!-- Dual List Box -->
        <mat-form-field *ngSwitchCase="'dualist'" appearance="outline">
          <mat-label>{{ field.label || field.name }}</mat-label>
          <mat-dual-listbox
            [formControlName]="field.name"
            [sourceList]="field.options || []"
            displayProperty="name"
            [destinationObjectReference]="field.referencePath || []">
          </mat-dual-listbox>
          <mat-error *ngIf="formInstance.get(field.name)?.hasError('required')">
            This field is required
          </mat-error>
        </mat-form-field>

        <ng-container *ngSwitchCase="'inner-table'">
          <label class="table-field-label">{{ field.label }}</label>
          <app-form-table
            [formControlName]="field.name"
            [meta]="field.innerTableConfig?.meta || []"
            [columns]="field.innerTableConfig?.columns || []"
            [dataMap]="field.innerTableConfig?.dataMap || {}">
          </app-form-table>
          <mat-error *ngIf="formInstance.get(field.name)?.invalid
                 && formInstance.get(field.name)?.touched">
            This field is required
          </mat-error>
        </ng-container>
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
    DataTableComponent,
    InnerableComponent,
    MatTimepickerToggle,
    MatTimepicker,
    MatTimepickerInput
  ]
})
export class DynamicFieldComponent implements AfterViewInit{

  @Input() formInstance!: FormGroup;
  @Input() field!: FormField;

  endDate: Date | undefined;
  @ViewChild('picker') picker!: MatDatepicker<any>;


  compareFn(o1: any | null, o2: any | null): boolean {
    if (!o1 || !o2) {
      return o1 === o2;
    }
    return o1.id === o2.id;
  }

  onStartDateChange(
    event: MatDatepickerInputEvent<Date>,
    range: number | { years?: number; months?: number; days?: number } = 0,
    fieldName: string
  ) {
    const start = event.value;
    if (!start) return;

    const end = new Date(start);

    if (typeof range === 'number') {
      end.setFullYear(end.getFullYear() + range);
    } else {
      if (range.years) end.setFullYear(end.getFullYear() + range.years);
      if (range.months) end.setMonth(end.getMonth() + range.months);
      if (range.days) end.setDate(end.getDate() + range.days);
    }

    const rangeGroup = this.formInstance.get(fieldName) as FormGroup;
    rangeGroup.patchValue({
      start: start,
      end: end
    });

    this.picker?.close();
  }

  currentYear = new Date().getFullYear();

  private bindTimeControl(fieldName: string): void {
    const control = this.formInstance.get(fieldName);
    if (!control) return;

    control.valueChanges.subscribe(value => {
      if (value instanceof Date) {
        const formatted = value.toTimeString().substring(0, 5);

        if (control.value !== formatted) {
          control.setValue(formatted, { emitEvent: false });
        }
      }
    });
  }

  ngAfterViewInit() {
    if (this.field?.type === 'time-range') {
      this.bindTimeControl(this.field.name);
    }
  }

}

