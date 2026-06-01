import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Observable, Subject ,async} from 'rxjs';
import { debounceTime, filter, take, takeUntil, } from 'rxjs/operators';
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
import {TripMetadataService} from '../service/util/trip.metadata.service';
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
    TripMetadataService,
  ],
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss'],
})
export class TripComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns    = TRIP_TABLE_META;
  protected readonly filterFormMeta  = TRIP_FILTER_FORM_META;
  protected readonly mainFormMeta    = TRIP_MAIN_FORM_META;
  protected readonly exportMeta      = TRIP_DATA_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel({ exclude: ['bulk-deactivate'] });

  // ===== Streams =====
  protected readonly trips$:    Observable<Trip[]>;
  protected readonly metadata$: Observable<TripMetadata>;
  protected readonly loading$:  Observable<boolean>;
  protected readonly error$:    Observable<any>;

  // ===== UI state =====
  protected activeRow:    Trip | null = null;
  protected selectedRows  = new Set<Trip>();
  protected selectedCount = 0;
  protected readonly async = async;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$         = new Subject<void>();
  private currentMetadata: TripMetadata | null = null;

  constructor(
    private facade:      TripFacadeService,
    private formService: TripFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.trips$    = this.facade.trips$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

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
      this.mainForm   = this.formService.buildMainForm(meta);
      this.watchFilterForm();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter =====

  private watchFilterForm(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
    ).subscribe(values => this.facade.filter(values));
  }

  // ===== Row interaction =====

  protected onRowClick(row: Trip): void  { this.activeRow = row; }
  protected onCloseDetailView(): void    { this.activeRow = null; }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.trips$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  protected reload(): void { this.facade.reload(); }

  // ===== Row actions — status transitions =====
  //
  // activate, suspend, discontinue all follow the exact same pattern.
  // Collapsed into executeTransition() — adding a new status action
  // is one line in the transitions map.

  protected onRowAction(action: string, row: Trip): void {
    const transitions: Record<string, [Observable<any>, string]> = {
      'activate':    [this.facade.activate(row),    'Trip activated successfully.'],
      'suspend':     [this.facade.suspend(row),     'Trip suspended successfully.'],
      'discontinue': [this.facade.discontinue(row), 'Trip discontinued successfully.'],
    };

    const match = transitions[action];
    if (match) this.executeTransition(match[0], match[1], row);
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  private executeTransition(
    operation$: Observable<any>,
    successMessage: string,
    row: Trip,
  ): void {
    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess(successMessage),
      error:    err => this.dialog.showMessage({ heading: 'Failed to execute', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.activeRow?.id === row.id) this.activeRow = null;
      },
    });
  }

  // ===== Create =====

  private openCreateForm(): void {
    this.dialog.showFormPopup({
      heading: 'Create Trip',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilder.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    this.facade.create(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Trip created successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to create trip', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      },
    });
  }

  // ===== Edit =====

  private openEditForm(row: Trip): void {
    if (!this.currentMetadata) return;

    this.mainForm = this.formService.buildMainFormForEdit(this.currentMetadata, row);

    this.dialog.showFormPopup({
      heading: 'Edit Trip',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else {
        this.mainForm = this.formService.buildMainForm(this.currentMetadata!);
      }
    });
  }

  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Trip updated successfully.'),
      error:    err => this.dialog.showMessage({ heading: 'Failed to update trip', message: err.errorMessage }),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      },
    });
  }

  // ===== Action panel =====

  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create':       () => this.openCreateForm(),
      'clear-search': () => this.formBuilder.resetForm(this.filterForm),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`No handler for: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'export-pdf':   () => this.toPdf(),
      'export-excel': () => this.toExcel(),
    };
    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`Unhandled dropdown: ${event.type}`);
  }

  // ===== Export =====

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

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'trips.xlsx');
  }

  // ===== Template helper =====

  protected trackByField(_: number, field: any): any { return field.key ?? _; }
}
