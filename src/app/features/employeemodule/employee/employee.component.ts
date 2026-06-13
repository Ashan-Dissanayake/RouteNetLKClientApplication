import {Component, OnDestroy, OnInit} from '@angular/core';
import {Employee} from '../entity/employee';
import {debounceTime,Observable, Subject, take, takeUntil, async,} from 'rxjs';
import {EmployeeFacadeService} from '../services/util/employeefacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {
  EMPLOYEE_DATA_EXPORT_META,
  EMPLOYEE_FILTER_FORM_META, EMPLOYEE_IMMUTABLE_CONTROLLERS_META, EMPLOYEE_MAIN_FORM_META,
  EMPLOYEE_TABLE_META,
} from '../model/employee.meta';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {EmployeeFormService} from '../services/util/employeefrom.service';
import {EmployeeMetadataService} from '../services/util/employee.metadata.service';
import {EmployeeMetadata} from '../model/employee.metadata.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  standalone: true,
  imports: [
    DataTableComponent,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    DatePipe,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ButtonPanelComponent,
    MatIconButton,
    AsyncPipe,
  ],
  styleUrl: './employee.component.scss',
  providers: [
    EmployeeFacadeService,
    EmployeeFormService,
    EmployeeMetadataService,
  ],
})
export class EmployeeComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns = EMPLOYEE_TABLE_META;
  protected readonly filterFormMeta= EMPLOYEE_FILTER_FORM_META;
  protected readonly mainFormMeta= EMPLOYEE_MAIN_FORM_META;
  protected readonly immutableControllers= EMPLOYEE_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta= EMPLOYEE_DATA_EXPORT_META;
  protected readonly actionPanelConfig= buildActionPanel();

  // ===== Streams (pass-through from facade) =====
  protected readonly employees$: Observable<Employee[]>;
  protected readonly metadata$:  Observable<EmployeeMetadata>;
  protected readonly loading$:   Observable<boolean>;
  protected readonly error$:     Observable<any>;

  // ===== UI state =====
  protected activeRow:    Employee | null = null;
  protected selectedRows  = new Set<Employee>();
  protected selectedCount = 0;
  protected readonly async = async;
  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$ = new Subject<void>();

  constructor(
    private facade:      EmployeeFacadeService,
    private formService: EmployeeFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.employees$ = this.facade.employees$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showErrorMessage('Failed to initialize module.', err),
      });

    this.facade.metadata$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(meta => {
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
  protected onRowClick(row: Employee): void {
    this.activeRow = row;
  }

  protected onCloseDetailView(): void {
    this.activeRow = null;
  }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.employees$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  // ===== Row actions =====
  protected onRowAction(action: string, row: Employee): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
    };
    if (actions[action]) actions[action]();
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  // ===== Action panel =====
  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create':          () => this.openCreateForm(),
      'bulk-deactivate': () => this.deactivateSelected(),
      'clear-search':    () => this.formBuilder.resetForm(this.filterForm),
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

  protected reload(): void {
    this.facade.reload();
  }

  // ===== Create =====
  private openCreateForm(): void {
    // Ensure immutable fields are editable on create
    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);

    this.dialog.showFormPopup({
      heading: 'Create Employee',
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
      next:     () => this.dialog.showSuccess('Employee created successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to create', err),

      complete: () => {
        this.facade.reload();
        this.formBuilder.resetForm(this.mainForm);
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      },
    });
  }

  // ===== Edit =====
  private openEditForm(row: Employee): void {
    this.mainForm.patchValue(row);

    this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, true);

    this.dialog.showFormPopup({
      heading: 'Edit Employee',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else {
        this.formBuilder.resetForm(this.mainForm);
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Employee updated successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to update', err),
      complete: () => {
        this.facade.reload();
        this.formBuilder.resetForm(this.mainForm);
        this.formBuilder.setControlsState(this.mainForm, this.immutableControllers, false);
      },
    });
  }

  // ===== Bulk deactivate =====
  private deactivateSelected(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to deactivate.');
      return;
    }

    this.dialog.showConfirmation({
      heading: 'Deactivate Employees',
      message: 'Only resigned employees will be deactivated. Are you sure?',
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.facade.deactivate(Array.from(this.selectedRows))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialog.showSuccess('Selected employees deactivated successfully.'),
          error: err => this.dialog.showErrorMessage('Deactivation failed', err),

          complete: () => {
            this.selectedRows.clear();
            this.selectedCount = 0;
            this.facade.reload();
          },
        });
    });
  }

  // ===== Export =====
  protected toPdf(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to print.');
      return;
    }

    this.dialog.showPrintDialog({
      width:   '1500px',
      height:  '650px',
      title:   'Employee Details',
      mode:    'table',
      data:    Array.from(this.selectedRows),
      columns: this.exportMeta,
    }).subscribe(result => {
      if (result) {
        this.selectedRows.clear();
        this.selectedCount = 0;
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'employees.xlsx');
  }

  // ===== Template helper =====
  protected trackByField(_: number, field: any): any {
    return field.key ?? _;
  }
}
