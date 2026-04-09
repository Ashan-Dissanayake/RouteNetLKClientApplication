import {ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {ChangeDetectorRef, Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {InnerTableColumn} from './inner-table-column.model';
import {FormField} from '../../models/formfieldata.model';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DynamicFieldComponent} from '../form/dynamic-field.component';

@Component({
  selector: 'app-form-table',
  standalone: true,
  imports: [
    ReactiveFormsModule, NgForOf, NgIf,
    forwardRef(() => DynamicFieldComponent), DynamicFieldComponent,  // ← self-reference
    // InnerableComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InnerableComponent),
      multi: true
    }
  ],
  // templateUrl: './form-table.component.html',
  template:
    `<div class="form-table-wrapper">

      <!-- Inline form — meta driven -->
      <div class="inline-form" *ngIf="rowForm">
        <form [formGroup]="rowForm">
          <dynamic-field
            *ngFor="let field of meta"
            [formInstance]="rowForm"
            [field]="field">
          </dynamic-field>
        </form>

        <div class="form-actions">

          <button *ngIf="!isEditMode"
                  type="button"
                  class="btn-action btn-add"
                  (click)="add()">
            + Add
          </button>

          <ng-container *ngIf="isEditMode">
            <button type="button"
                    class="btn-action btn-update"
                    (click)="update()">
              Update
            </button>
            <button type="button"
                    class="btn-action btn-cancel"
                    (click)="cancel()">
              Cancel
            </button>
          </ng-container>

        </div>
      </div>

      <!-- Snapshot table -->
      <div class="table-section" *ngIf="snapshots.length > 0">
        <table class="form-table">
          <thead>
          <tr>
            <th *ngFor="let col of columns">{{ col.header }}</th>
            <th class="actions-col"></th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let row of snapshots; let i = index"
              class="snapshot-row"
              [class.selected]="selectedIndex === i"
              (click)="selectRow(i)">
            <td *ngFor="let col of columns">
              {{ getValue(row, col.field) }}
            </td>
            <td class="actions-col">
              <button type="button"
                      class="btn-remove"
                      (click)="remove(i); $event.stopPropagation()">
                ✕
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="snapshots.length === 0">
        No records added yet.
      </div>

    </div>
 `,
  styleUrl:    './innertable.component.scss'
})
export class InnerableComponent implements ControlValueAccessor,OnChanges  {
  @Input() columns: InnerTableColumn[] = [];
  @Input() meta: FormField[] = [];
  @Input() dataMap: Record<string, any> = {};  // ← added, same pattern as your main forms

  snapshots: any[] = [];
  selectedIndex = -1;
  rowForm!: FormGroup;
  displayedColumns: string[] = [];

  private onChange: (v: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private formBuilder: FormbuilderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // rebuild form if meta or dataMap changes
    if (changes['meta'] || changes['dataMap']) {
      if (this.meta?.length) {
        this.rowForm = this.formBuilder.build(this.meta, this.dataMap);
      }
    }
    if (changes['columns']) {
      this.displayedColumns = [...this.columns.map(c => c.field), 'actions'];
    }
  }

  getValue(row: any, field: string) {
    return field.split('.').reduce((a: any, p) => a?.[p], row) ?? '';
  }

  get isEditMode() { return this.selectedIndex >= 0; }

  add() {
    if (this.rowForm.invalid) {
      this.rowForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
    this.snapshots = [...this.snapshots, { ...this.rowForm.value }];
    this.formBuilder.resetForm(this.rowForm);   // ← use service helper
    this.emit();
  }

  selectRow(index: number) {
    this.selectedIndex = index;
    const row = this.snapshots[index];
    const flattened = this.flattenRow(row);
    this.rowForm.patchValue(flattened);
    this.cdr.markForCheck();
  }

  private flattenRow(row: any): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key of Object.keys(this.rowForm.controls)) {
      result[key] = key.split('.').reduce((a, p) => a?.[p], row) ?? null;
    }
    return result;
  }

  // selectRow(index: number) {
  //   this.selectedIndex = index;
  //   console.log(this.snapshots[index]);
  //   this.rowForm.patchValue(this.snapshots[index]);
  //   this.cdr.markForCheck();
  // }

  update() {
    if (this.rowForm.invalid) {
      this.rowForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
    this.snapshots = this.snapshots.map((r, i) =>
      i === this.selectedIndex
        ? { ...r, ...this.rowForm.value }  // ← r has full original object including partrequestitem
        : r
    );
    this.selectedIndex = -1;
    this.formBuilder.resetForm(this.rowForm);
    this.emit();
  }

  cancel() {
    this.selectedIndex = -1;
    this.formBuilder.resetForm(this.rowForm);   // ← use service helper
    this.cdr.markForCheck();
  }

  remove(index: number) {
    this.snapshots = this.snapshots.filter((_, i) => i !== index);
    if (this.selectedIndex === index) { this.cancel(); }
    this.emit();
  }

  private emit() {
    this.onChange(this.snapshots);
    this.onTouched();
    this.cdr.markForCheck();
  }

  // CVA
  writeValue(v: any[]) {
    this.snapshots = v ? [...v] : [];
    this.cdr.markForCheck();
  }
  registerOnChange(fn: any)    { this.onChange = fn; }
  registerOnTouched(fn: any)   { this.onTouched = fn; }
  setDisabledState(d: boolean) { d ? this.rowForm?.disable() : this.rowForm?.enable(); }
}
