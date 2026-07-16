import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Observable, Subject ,async} from 'rxjs';
import { debounceTime, take, takeUntil, } from 'rxjs/operators';
import {TRIP_DATA_EXPORT_META, TRIP_FILTER_FORM_META, TRIP_MAIN_FORM_META, TRIP_TABLE_META} from '../model/trip.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {Trip} from '../entity/trip';
import {TripMetadata} from '../model/trip.metadata.model';
import {TripFacadeService} from '../service/util/tripfacade.service';
import {TripFormService} from '../service/util/tripfrom.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {TripLookupDataService} from '../service/util/trip.lookupdata.service';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';


@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, NgForOf, NgIf, NgClass, DatePipe,
    MatButton, MatDivider, MatIcon,
    ButtonPanelComponent, DynamicFieldComponent,
    DataTableComponent, SideViewComponent, TableCellDirective,
    MatProgressBar, MatCard, MatMenuTrigger, MatIconButton, MatMenuItem,
    MatMenu, MatCardTitle, MatCardContent, AsyncPipe,
  ],
  providers: [
    TripFacadeService,
    TripFormService,
    TripLookupDataService,
  ],
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss'],
})
/**
 * Component for managing and displaying trip data.
 * Provides functionality for filtering, creating, editing, and exporting trips.
 */
export class TripComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  /** Metadata for table columns. */
  protected readonly tableColumns = TRIP_TABLE_META;
  /** Metadata for the filter form. */
  protected readonly filterFormMeta = TRIP_FILTER_FORM_META;
  /** Metadata for the main form. */
  protected readonly mainFormMeta = TRIP_MAIN_FORM_META;
  /** Metadata for exporting data. */
  protected readonly exportMeta = TRIP_DATA_EXPORT_META;
  /** Configuration for the action panel. */
  protected readonly actionPanelConfig = buildActionPanel({ exclude: ['bulk-deactivate'] });

  // ===== Streams =====
  /** Observables stream of trips. */
  protected readonly trips$: Observable<Trip[]>;
  protected readonly metadata$: Observable<TripMetadata>;
  protected readonly loading$: Observable<boolean>;
  protected readonly error$: Observable<any>;

  // ===== UI state =====
  /** Currently active row in the table. */
  protected activeRow: Trip | null = null;
  /** Set of selected rows in the table. */
  protected selectedRows = new Set<Trip>();
  /** Count of selected rows. */
  protected selectedCount = 0;
  /** Reference to the async pipe. */
  protected readonly async = async;

  // ===== Forms =====

  /** Form group for filtering trips. */
  protected filterForm: FormGroup = new FormGroup({});
  /** Form group for managing trip data. */
  protected mainForm: FormGroup = new FormGroup({});
  /** Subject to manage component destruction. */
  private destroy$ = new Subject<void>();
  /** Current metadata for trips. */
  private currentMetadata: TripMetadata | null = null;

  /**
   * Constructor for the TripComponent.
   * @param facade Service for managing trip data.
   * @param formService Service for building forms.
   * @param formBuilder Service for form utilities.
   * @param dialog Service for displaying dialogs.
   */
  constructor(
    private facade: TripFacadeService,
    private formService: TripFormService,
    private formBuilder: FormbuilderService,
    private dialog: DialogService,
  ) {
    this.trips$ = this.facade.trips$;
    this.metadata$ = this.facade.metadata$;
    this.loading$ = this.facade.loading$;
    this.error$ = this.facade.error$;
  }

  // ===== Lifecycle =====

  /**
   * Lifecycle hook for component initialization.
   * Initializes the trip module and sets up metadata subscriptions.
   */
  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showError('Failed to initialize trip module.', err),
      });

    this.facade.metadata$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(meta => {
      this.currentMetadata = meta;
      this.filterForm = this.formService.buildFilterForm(meta);
      this.mainForm = this.formService.buildMainForm(meta);
      this.watchFilterForm();
    });
  }

  /**
   * Lifecycle hook for component destruction.
   * Cleans up subscriptions and resources.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter =====
  /**
   * Watches for changes in the filter form and applies the filter.
   */
  private watchFilterForm(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
    ).subscribe(values => this.facade.filter(values));
  }

  // ===== Row interaction =====

  /**
   * Handles row click events.
   * @param row The clicked row.
   */
  protected onRowClick(row: Trip): void {
    this.activeRow = row;
  }

  /**
   * Closes the detail view of the active row.
   */
  protected onCloseDetailView(): void {
    this.activeRow = null;
  }

  /**
   * Handles checkbox changes for rows.
   * @param event The checkbox event.
   */
  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  /**
   * Selects or deselects all rows.
   * @param checked Whether all rows should be selected.
   */
  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.trips$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  /**
   * Reloads the trip data.
   */
  protected reload(): void {
    this.facade.reload();
  }

  // ===== Row actions — status transitions =====

  /**
   * Handles row actions such as activate, suspend, or discontinue.
   * @param action The action to perform.
   * @param row The row to apply the action to.
   */
  protected onRowAction(action: string, row: Trip): void {
    const transitions: Record<string, [Observable<any>, string]> = {
      'activate': [this.facade.activate(row), 'Trip activated successfully.'],
      'suspend': [this.facade.suspend(row), 'Trip suspended successfully.'],
      'discontinue': [this.facade.discontinue(row), 'Trip discontinued successfully.'],
    };

    const match = transitions[action];
    if (match) this.executeTransition(match[0], match[1], row);
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  /**
   * Executes a status transition for a row.
   * @param operation$ The observable operation to execute.
   * @param successMessage The success message to display.
   * @param row The row to apply the transition to.
   */
  private executeTransition(
    operation$: Observable<any>,
    successMessage: string,
    row: Trip,
  ): void {
    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialog.showSuccess(successMessage),
      error: err => this.dialog.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.activeRow?.id === row.id) this.activeRow = null;
      },
    });
  }

  // ===== Create =====

  /**
   * Opens the form for creating a new trip.
   */
  private openCreateForm(): void {
    this.dialog.showFormPopup({
      heading: 'Create Trip',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width: '900px',
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilder.resetForm(this.mainForm);
    });
  }

  /**
   * Saves a new trip.
   * @param formData The data to save.
   */
  private save(formData: any): void {
    this.facade.create(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialog.showSuccess('Trip created successfully.'),
      error: err => this.dialog.showMessage({ heading: 'Failed to create trip', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      },
    });
  }

  // ===== Edit =====

  /**
   * Opens the form for editing an existing trip.
   * @param row The trip to edit.
   */
  private openEditForm(row: Trip): void {
    if (!this.currentMetadata) return;

    this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);

    this.dialog.showFormPopup({
      heading: 'Edit Trip',
      form: this.mainForm,
      meta: this.mainFormMeta,
      width: '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else {
        this.mainForm = this.formService.buildMainForm(this.currentMetadata!);
      }
    });
  }

  /**
   * Updates an existing trip.
   * @param formData The updated data.
   */
  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialog.showSuccess('Trip updated successfully.'),
      error: err => this.dialog.showMessage({ heading: 'Failed to update trip', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      },
    });
  }

  // ===== Action panel =====

  /**
   * Handles actions triggered from the action panel.
   * @param event The button click event.
   */
  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create': () => this.openCreateForm(),
      'clear-search': () => this.formBuilder.resetForm(this.filterForm),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`No handler for: ${event.type}`);
  }

  /**
   * Handles dropdown-only actions.
   * @param event The button click event.
   */
  protected onDropdownOnlyClick(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'export-pdf': () => this.toPdf(),
      'export-excel': () => this.toExcel(),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`Unhandled dropdown: ${event.type}`);
  }

  // ===== Export =====

  /**
   * Exports selected rows to a PDF.
   */
  protected toPdf(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to print.');
      return;
    }
    this.dialog.showPrintDialog({
      width: '1500px', height: '650px',
      title: 'Trip Details', mode: 'table',
      data: Array.from(this.selectedRows), columns: this.exportMeta,
    }).subscribe(result => {
      if (result) { this.selectedRows.clear(); this.selectedCount = 0; }
    });
  }

  /**
   * Exports selected rows to an Excel file.
   */
  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'trips.xlsx');
  }

  // ===== Template helper =====

  /**
   * Tracks items by their field key or index.
   * @param _ The index of the item.
   * @param field The field to track.
   * @returns The key of the field or the index.
   */
  protected trackByField(_: number, field: any): any {
    return field.key ?? _;
  }
}
