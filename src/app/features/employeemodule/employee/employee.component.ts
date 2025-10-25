import {Component, OnDestroy, OnInit} from '@angular/core';
import {Employee} from '../model/employee';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {EmployeefacadeService} from '../employeefacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {EmployeeActionPanelMeta, EmployeeFilterMeta, EmployeeTableMeta} from '../employee.meta';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Department} from '../model/department';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button-panel/button-panel.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  standalone: true,
  imports: [
    DataTableComponent,
    MatButton,
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
  ],
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent implements OnInit, OnDestroy {

  // ===== Metadata & Configurations =====
  readonly tableColumns  = EmployeeTableMeta;
  readonly employeeFilterMeta = EmployeeFilterMeta;
  readonly actionPanelConfig = EmployeeActionPanelMeta;

  // ===== Form Controls =====
  employeeFilterForm: FormGroup = new FormGroup({});

  // --- Data ---
  employees!: Employee[];
  departments!:Department[];

  dataInitialized   = false;

  private destroy$ = new Subject<void>();

  selectedRows = new Set<Employee>();
  activeEmployee: Employee | null = null;

  constructor(
    private formBuilder: FormbuilderService,
    private employeefacadeService: EmployeefacadeService,
    private dialogService: DialogService
  ) {}

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.initialize();
    this.configureActionPanel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  private initialize(): void {
    forkJoin({
      departments: this.employeefacadeService.loadDepartments(),
    }).subscribe({
      next: data => this.handleMetadataLoad(data),
      error: (err) => this.dialogService.showError('Failed to load employee metadata.', err)
    });
    this.loadEmployeeTable();
  }

  private handleMetadataLoad(data: any):void {
    this.departments = data.departments;
    this.dataInitialized = true;

    this.initializeForms();
    this.subscribeToFilterChanges();
  }

  private initializeForms(): void {
    this.employeeFilterForm = this.formBuilder.build(this.employeeFilterMeta, {
      ssdepartment: this.departments
    });
  }

  private configureActionPanel(): void {
    this.actionPanelConfig.forEach(btn => {
      if (btn.type === 'bulk-deactivate') {
        btn.disabled = () => this.selectedRows.size === 0;
      }
    });
  }

  // ===== Data Loading =====
  private loadEmployeeTable():void {
    this.employeefacadeService.loadEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.employees = data);
  }

  // ===== Filtering =====
  private subscribeToFilterChanges(): void {
    this.employeeFilterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(filters => {
        this.employeefacadeService.searchEmployees(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.employees = data);
      });
  }

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.employeeFilterForm.reset()
  };

  onActionTriggered(event: ButtonClickEvent) {
    const handler = this.actionHandlers[event.type];
    if (handler) handler();
    else this.dialogService.showWarning(`No handler defined for action: ${event.type}`);
  }


  onDropdownOnlyClick(event: ButtonClickEvent) {
    const dropdownTypes = ['export-pdf', 'export-excel'];
    if (dropdownTypes.includes(event.type)) {
      this.actionHandlers[event.type]?.();
    } else {
      this.dialogService.showWarning(`Unhandled dropdown action: ${event.type}`);
    }
  }

  // ===== Table Selection =====
  onRowClick(row: any): void {
    this.activeEmployee = row;
  }

  closeBranchDetails(): void {
    this.activeEmployee = null;
  }

  onRowAction(action: string, row: any) { }

  // Selection Handling
  onRowCheckboxChanged(event: CheckboxEvent<any>) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.employees.forEach(row => this.selectedRows.add(row));
  }


}
