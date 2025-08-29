import {AfterViewInit, Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {MatListOption, MatSelectionList} from "@angular/material/list";
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from "@angular/forms";
import {MatCard} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {isEqual} from 'lodash';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";

/**
 * MatDualListboxComponent is a standalone Angular component that facilitates the management and transfer
 * of items between a source list and a destination list. It provides functionality for filtering, moving,
 * and searching within either list, enabling easy and dynamic dual list operations in user interfaces.
 *
 * The component implements ControlValueAccessor to integrate seamlessly with Angular reactive forms,
 * supporting bidirectional data binding and form validation. It features search functionality for both
 * source and destination lists, supports nested object property mapping, and provides methods for
 * individual and bulk item transfers between lists.
 *
 * @template T - The type of items managed by the component. The items must extend `Record<string, any>`.
 *
 * <p><strong>Features</strong></p>
 * <ul>
 *    <li>Dual list management with source and destination lists</li>
 *    <li>Search and filter functionality for both lists</li>
 *    <li>Individual and bulk item transfer operations</li>
 *    <li>Angular reactive forms integration via ControlValueAccessor</li>
 *    <li>Support for nested object property mapping</li>
 *    <li>Material Design UI components integration</li>
 * </ul>
 *
 * <p><strong>Authorship</strong></p>
 * <ul>
 *    <li><b>Author:</b> Dileesha Ekanayake</li>
 *    <li><b>Email:</b> dileesha.r.ekanayake@gmail.com</li>
 *    <li><b>Created:</b> 2024</li>
 *    <li><b>Version:</b> 1.0.0</li>
 *    <li><b>Responsibility:</b> Design, implementation, and documentation of the dual listbox component
 *        with Angular Material integration. Provides extensibility for filtering, nested object mapping,
 *        and seamless form control integration with reactive forms support.</li>
 * </ul>
 */
@Component({
  selector: 'mat-dual-listbox',
  templateUrl: './mat-dual-listbox.component.html',
  imports: [
    MatCard,
    MatSelectionList,
    MatListOption,
    MatButton,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon
  ],
  styleUrls: ['./mat-dual-listbox.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatDualListboxComponent),
      multi: true
    }
  ]
})
export class MatDualListboxComponent<T extends Record<string, any>> implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor {

  @Input() sourceList: T[] = [];
  @Input() destinationObjectReference: string[] = [];
  @Input() displayProperty: keyof T | '' = '';
  protected destinationList: T[] = [];
  private originalSourceList: T[] = [];
  private originalDestinationList: T[] = [];
  protected form!: FormGroup;

  @ViewChild('SourceList') SourceList!: MatSelectionList;
  @ViewChild('DestinationList') DestinationList!: MatSelectionList;

  private onChange: (value: T[]) => void = () => {
  };
  private onTouched: () => void = () => {
  };
  private disabled = false;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      sourceListSearch: new FormControl(),
      destinationListSearch: new FormControl(),
    })
  }

  ngOnInit() {
    this.form.controls['destinationListSearch'].disabled;
  }

  /**
   * Responds to changes in input-bound properties of the component.
   * Executes logic whenever the bound properties are updated.
   *
   * @param {SimpleChanges} changes - An object that contains the changes to the bound properties. Each property corresponds to a component input and contains its current and previous values.
   * @return {void} This method does not return a value.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sourceList']) {
      this.originalSourceList = [...this.sourceList];
      this.resetAndFilterSourceList();
    }
  }

  /**
   * Writes the provided value to the destination list, processes and maps the values accordingly,
   * and updates the source and destination lists.
   *
   * @param {T[]} value - The array of values to process and write to the destination list. If the value is null or undefined, the destination list is cleared.
   * @return {void} This method does not return any value.
   */
  writeValue(value: T[]): void {
    if (value) {
      this.destinationList = this.getMappedDestinationValues(value);
      this.originalDestinationList = [...this.destinationList];
      this.resetAndFilterSourceList();

      // Ensure DestinationList exists before accessing options
      setTimeout(() => {
        if (this.DestinationList) {
          this.DestinationList.options.forEach(option => option._setSelected(true));
        }
      });
    } else {
      this.destinationList = [];
    }
    this.onChange(this.destinationList);
  }

  /**
   * Maps and filters the input array based on the `destinationObjectReference`.
   * For each item in the `value` array, it retrieves a nested value determined
   * by the keys in the `destinationObjectReference`. Only non-null values are returned.
   *
   * @param {T[]} value - The array of items to be processed and filtered.
   * @return {T[]} - A filtered array containing only the mapped and non-null values.
   */
  private getMappedDestinationValues(value: T[]): T[] {
    if (this.destinationObjectReference.length > 0) {
      return value.map(item => {
        const nestedValue = this.destinationObjectReference.reduce((acc: any, key: string) => acc ? acc[key] : undefined, item);
        return nestedValue ? nestedValue : null;
      }).filter((item): item is T => item !== null);
    }
    return value;
  }

  /**
   * Resets the source list to a filtered version of the original source list.
   * Filters out items from the source list that are present in the destination list.
   *
   * @return {void} This method does not return a value.
   */
  private resetAndFilterSourceList(): void {
    this.sourceList = this.originalSourceList.filter(item =>
      !this.destinationList.some(destItem => isEqual(destItem, item))
    );
  }

  /**
   * Registers a callback function that is called when the value changes.
   *
   * @param {function(T[]): void} fn - A function that is triggered with the updated value.
   * @return {void} This method does not return a value.
   */
  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function to be invoked when the control is touched.
   * This is typically used to notify the parent component or form control
   * that the user has interacted with the control.
   *
   * @param {() => void} fn - The callback function to handle the touched event.
   * @return {void} This method does not return a value.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the component.
   *
   * @param {boolean} isDisabled - A boolean value indicating whether the component should be disabled.
   * @return {void} No return value.
   */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Moves selected items between the source list and the destination list based on the provided direction.
   *
   * @param {boolean} isToDestination - A boolean flag to determine the direction of movement. If true, moves items from source list to destination list. If false, moves items from destination list to source list.
   * @return {void} No return value.
   */
  moveItems(isToDestination: boolean): void {
    const selectedItems = (isToDestination ? this.SourceList : this.DestinationList).selectedOptions.selected.map(option => option.value);
    if (isToDestination) {
      this.sourceList = this.sourceList.filter(item => !selectedItems.includes(item));
      this.destinationList.push(...selectedItems);
      this.originalDestinationList = [...this.destinationList];
    } else {
      this.destinationList = this.destinationList.filter(item => !selectedItems.includes(item));
      this.sourceList.push(...selectedItems);
      this.originalDestinationList = [...this.destinationList];
    }
    this.onChange(this.destinationList);
    this.onTouched();
    this.clearSelection(isToDestination);
  }

  /**
   * Moves all items between source and destination lists based on the specified direction.
   *
   * @param {boolean} isToDestination - Indicates the direction of the move.
   * If true, moves all items from the source list to the destination list.
   * If false, moves all items from the destination list back to the source list.
   *
   * @return {void} This method does not return any value.
   */
  moveAllItems(isToDestination: boolean): void {
    if (isToDestination) {
      this.destinationList.push(...this.sourceList);
      this.originalDestinationList = [...this.destinationList];
      this.sourceList = [];
    } else {
      this.sourceList.push(...this.destinationList);
      this.destinationList = [];
      this.originalDestinationList = [...this.destinationList];
    }
    this.onChange(this.destinationList);
    this.onTouched();
  }

  /**
   * Clears the selection from either the source list or the destination list based on the provided parameter.
   *
   * @param {boolean} isToDestination - A flag indicating whether to clear the destination list (`true`) or source list (`false`).
   * @return {void} This method does not return a value.
   */
  private clearSelection(isToDestination: boolean): void {
    if (isToDestination) {
      this.SourceList.selectedOptions.clear();
    } else {
      this.DestinationList.selectedOptions.clear();
    }
  }

  /**
   * Filters the original list based on the search value from the specified form control.
   *
   * @param {string} searchControlName - The name of the form control used to retrieve the search input.
   * @param {T[]} originalList - The original unfiltered list of items.
   * @param {T[]} targetList - The list to store the filtered results. It will reflect the filtered or full contents of the original list.
   * @return {T[]} - The filtered list of items matching the search input, or the original list if no input is entered.
   */
  filterList(searchControlName: string, originalList: T[], targetList: T[]): T[] {
    const searchValue = this.form.controls[searchControlName]?.value?.toLowerCase() || '';

    if (searchValue) {
      // Filter the original list based on the search value
      targetList = originalList.filter(item =>
        (item[this.displayProperty] as unknown as string).toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      // If search input is empty, show all items again
      targetList = [...originalList];
    }

    return targetList; // Return the filtered or original list
  }

  /**
   * Filters the source list based on the provided search criteria and updates the source list.
   *
   * @return {void} This method does not return a value. It updates the sourceList property with the filtered results.
   */
  filterSourceList(): void {
    this.sourceList = this.filterList('sourceListSearch', this.originalSourceList, this.sourceList);
  }

  /**
   * Filters the destination list based on the search criteria provided and updates the existing list.
   *
   * @return {void} Updates the `destinationList` property with the filtered results.
   */
  filterDestinationList(): void {
    this.destinationList = this.filterList('destinationListSearch', this.originalDestinationList, this.destinationList);
  }

  /**
   * A lifecycle hook that is called after the component's view has been fully initialized.
   * This method ensures that all options in the DestinationList are marked as selected.
   *
   * @return {void} This method does not return a value.
   */
  ngAfterViewInit(): void {
    if (this.DestinationList) {
      this.DestinationList.options.forEach(option => option._setSelected(true));
    }
  }

}
