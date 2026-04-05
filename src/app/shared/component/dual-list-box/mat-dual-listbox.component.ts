import {
  AfterViewInit,
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  Optional,
  Self,
  HostListener
} from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import {
  ControlValueAccessor,
  ReactiveFormsModule,
  NgControl
} from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { isEqual } from 'lodash';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { Subject } from 'rxjs';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'mat-dual-listbox',
  templateUrl: './mat-dual-listbox.component.html',
  styleUrls: ['./mat-dual-listbox.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    MatSelectionList,
    MatListOption,
    MatButton,
    ReactiveFormsModule,
    MatIcon,
    JsonPipe
  ],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: forwardRef(() => MatDualListboxComponent)
    }
  ]
})
export class MatDualListboxComponent<T extends Record<string, any>>
  implements
    OnInit,
    OnChanges,
    AfterViewInit,
    OnDestroy,
    ControlValueAccessor,
    MatFormFieldControl<T[]> {

  /* ========= Inputs & Data ========= */
  @Input() sourceList: T[] = [];
  @Input() destinationObjectReference: string[] = [];
  @Input() displayProperty: keyof T | '' = '';
  @Input() placeholder: string = '';
  @Input() required = false;

  protected destinationList: T[] = [];
  // originalSourceList is now only needed to reset sourceList when value changes
  private originalSourceList: T[] = [];

  @ViewChild('SourceList') SourceList!: MatSelectionList;
  @ViewChild('DestinationList') DestinationList!: MatSelectionList;

  private oldDestinationList: T[] = [];

  /* ========= CVA & MatFormFieldControl Properties (Required) ========= */
  static nextId = 0;
  controlType = 'mat-dual-listbox';
  id = `mat-dual-listbox-${MatDualListboxComponent.nextId++}`;
  describedBy = '';
  stateChanges = new Subject<void>();
  disabled = false;
  focused = false;

  get errorState(): boolean {
    const control = this.ngControl?.control;
    return !!(control && control.invalid && (control.dirty));
  }

  get value(): T[] { return this.destinationList; }
  set value(val: T[] | null) {
    this.destinationList = val || [];
    this.onChange(this.destinationList);
    this.stateChanges.next();
  }

  get empty(): boolean { return !this.destinationList || this.destinationList.length === 0; }
  get shouldLabelFloat(): boolean { return this.focused || !this.empty || !!this.placeholder; }
  setDescribedByIds(ids: string[]): void { this.describedBy = ids.join(' '); }
  onContainerClick(_: MouseEvent): void { /* focus on the component container */ }

  private onChange: (value: T[]) => void = () => {};
  private onTouched: () => void = () => {};


  /* ========= Constructor & Init ========= */
  constructor(
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sourceList']) {
      // Store the original list to ensure proper value mapping on writeValue
      this.originalSourceList = [...this.sourceList];
      this.resetSourceList();
    }
  }

  ngAfterViewInit(): void {
    console.log(this.sourceList)
    //this.DestinationList?.options.forEach(option => option._setSelected(true));
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  @HostListener('focusin')
  _handleFocusIn() {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  @HostListener('focusout')
  _handleFocusOut() {
    if (this.focused) {
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  /* ========= ControlValueAccessor (CVA) ========= */
  writeValue(value: T[] | null): void {
    if (value) {
      this.destinationList = this.getMappedDestinationValues(value);
      //this.resetSourceList();
      //setTimeout(() => this.DestinationList?.options.forEach(option => option._setSelected(true)));
    } else {
      this.destinationList = [];
    }
    this.onChange(this.destinationList);
    this.stateChanges.next();
  }

  registerOnChange(fn: (value: T[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
  }

  /* ========= Business Logic ========= */
  private getMappedDestinationValues(value: T[]): T[] {
    if (this.destinationObjectReference.length > 0) {
      return value
        .map(item => {
          const nestedValue = this.destinationObjectReference
            .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), item);
          return nestedValue ? nestedValue : null;
        })
        .filter((item): item is T => item !== null);
    }
    return value;
  }

  private resetSourceList(): void {
    // Recalculates the source list based on items NOT in the destination list
    this.sourceList = this.originalSourceList.filter(item =>
      !this.destinationList.some(destItem => isEqual(destItem, item))
    );
  }

  moveItems(isToDestination: boolean): void {
    const list = isToDestination ? this.SourceList : this.DestinationList;
    const selectedItems = list.selectedOptions.selected.map(option => option.value as T);

    if (isToDestination) {
      this.sourceList = this.sourceList.filter(item => !selectedItems.includes(item));
      this.destinationList.push(...selectedItems);
    } else {
      this.destinationList = this.destinationList.filter(item => !selectedItems.includes(item));
      this.sourceList.push(...selectedItems);
    }

    this.onChange(this.destinationList);
    this.onTouched();
    this.clearSelection(list);
    this.stateChanges.next();
  }

  private getNestedValue(obj: any, keys: string[]): any {
    return keys.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }


  moveAllItems(isToDestination: boolean): void {
    if (isToDestination) {
      this.destinationList.push(...this.sourceList);
      this.sourceList = [];
    } else {
      this.sourceList.push(...this.destinationList);
      this.destinationList = [];
    }
    this.onChange(this.destinationList);
    this.onTouched();
    this.stateChanges.next();
  }

  private clearSelection(list: MatSelectionList): void {
    list.selectedOptions.clear();
  }
}
