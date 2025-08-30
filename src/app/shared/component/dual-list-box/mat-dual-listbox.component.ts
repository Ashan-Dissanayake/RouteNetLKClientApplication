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
  DoCheck,
  Optional,
  Self,
  HostListener
} from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  NgControl
} from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { isEqual } from 'lodash';
import {MatFormField, MatFormFieldControl} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { Subject } from 'rxjs';

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
    // MatInput,
    MatIcon,
    // MatFormField,
    // MatLabel
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
    DoCheck,
    ControlValueAccessor,
    MatFormFieldControl<T[]> {

  /* ========= Inputs ========= */
  @Input() sourceList: T[] = [];
  @Input() destinationObjectReference: string[] = [];
  @Input() displayProperty: keyof T | '' = '';
  @Input() placeholder: string = '';
  @Input() required = false;

  /* ========= Internal State ========= */
  protected destinationList: T[] = [];
  private originalSourceList: T[] = [];
  private originalDestinationList: T[] = [];

  protected form!: FormGroup;

  @ViewChild('SourceList') SourceList!: MatSelectionList;
  @ViewChild('DestinationList') DestinationList!: MatSelectionList;

  /* ========= ControlValueAccessor via NgControl ========= */
  private onChange: (value: T[]) => void = () => {};
  private onTouched: () => void = () => {};
  disabled = false;

  /* ========= MatFormFieldControl ========= */
  static nextId = 0;
  controlType = 'mat-dual-listbox';
  id = `mat-dual-listbox-${MatDualListboxComponent.nextId++}`;
  describedBy = '';
  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;

  get value(): T[] {
    return this.destinationList;
  }
  set value(val: T[] | null) {
    this.destinationList = val || [];
    this.onChange(this.destinationList);
    this.stateChanges.next();
  }

  get empty(): boolean {
    return !this.destinationList || this.destinationList.length === 0;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty || !!this.placeholder;
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(_: MouseEvent): void {
    // optional: focus search input
  }

  /* ========= Constructor ========= */
  constructor(
    private formBuilder: FormBuilder,
    @Optional() @Self() public ngControl: NgControl
  ) {
    this.form = this.formBuilder.group({
      sourceListSearch: new FormControl<string | null>(null),
      destinationListSearch: new FormControl<string | null>(null),
    });

    // Automatically register CVA
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  /* ========= Lifecycle ========= */
  ngOnInit() {
    this.form.controls['destinationListSearch'].disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sourceList']) {
      this.originalSourceList = [...this.sourceList];
      this.resetAndFilterSourceList();
    }
  }

  ngAfterViewInit(): void {
    if (this.DestinationList) {
      this.DestinationList.options.forEach(option => option._setSelected(true));
    }
  }

  ngDoCheck(): void {
    const control = this.ngControl?.control;
    this.errorState = !!(control && control.invalid && (control.dirty));
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

  /* ========= CVA ========= */
  writeValue(value: T[] | null): void {
    if (value) {
      this.destinationList = this.getMappedDestinationValues(value);
      this.originalDestinationList = [...this.destinationList];
      this.resetAndFilterSourceList();
      setTimeout(() => {
        if (this.DestinationList) {
          this.DestinationList.options.forEach(option => option._setSelected(true));
        }
      });
    } else {
      this.destinationList = [];
    }
    this.onChange(this.destinationList);
    this.stateChanges.next();
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
      this.form.controls['destinationListSearch'].disable({ emitEvent: false });
    }
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

  private resetAndFilterSourceList(): void {
    this.sourceList = this.originalSourceList.filter(item =>
      !this.destinationList.some(destItem => isEqual(destItem, item))
    );
  }

  moveItems(isToDestination: boolean): void {
    const selectedItems = (isToDestination ? this.SourceList : this.DestinationList)
      .selectedOptions.selected.map(option => option.value as T);

    if (isToDestination) {
      this.sourceList = this.sourceList.filter(item => !selectedItems.includes(item));
      this.destinationList.push(...selectedItems);
    } else {
      this.destinationList = this.destinationList.filter(item => !selectedItems.includes(item));
      this.sourceList.push(...selectedItems);
    }

    this.originalDestinationList = [...this.destinationList];
    this.onChange(this.destinationList);
    this.onTouched();
    this.clearSelection(isToDestination);
    this.stateChanges.next();
  }

  moveAllItems(isToDestination: boolean): void {
    if (isToDestination) {
      this.destinationList.push(...this.sourceList);
      this.sourceList = [];
    } else {
      this.sourceList.push(...this.destinationList);
      this.destinationList = [];
    }
    this.originalDestinationList = [...this.destinationList];
    this.onChange(this.destinationList);
    this.onTouched();
    this.stateChanges.next();
  }

  private clearSelection(isToDestination: boolean): void {
    if (isToDestination) {
      this.SourceList.selectedOptions.clear();
    } else {
      this.DestinationList.selectedOptions.clear();
    }
  }

  filterList(searchControlName: string, originalList: T[], targetList: T[]): T[] {
    const searchValue = (this.form.controls[searchControlName]?.value || '').toString().toLowerCase();
    if (searchValue) {
      targetList = originalList.filter(item =>
        ((this.displayProperty ? item[this.displayProperty] : item) as unknown as string)
          ?.toString()
          .toLowerCase()
          .includes(searchValue)
      );
    } else {
      targetList = [...originalList];
    }
    return targetList;
  }

  filterSourceList(): void {
    this.sourceList = this.filterList('sourceListSearch', this.originalSourceList, this.sourceList);
  }

  filterDestinationList(): void {
    this.destinationList = this.filterList('destinationListSearch', this.originalDestinationList, this.destinationList);
  }
}
