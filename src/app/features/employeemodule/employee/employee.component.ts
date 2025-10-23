import {Component, OnDestroy, OnInit} from '@angular/core';
import {Employee} from '../model/employee';
import { Subject, takeUntil} from 'rxjs';
import {EmployeefacadeService} from '../employeefacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {EmployeeTableMeta} from '../employee.meta';

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
  ],
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent implements OnInit, OnDestroy {

  // ===== Metadata & Configurations =====
  readonly tableColumns  = EmployeeTableMeta;

  // --- Data ---
  employees!: Employee[];

  private destroy$ = new Subject<void>();

  selectedRows = new Set<Employee>();
  activeEmployee: Employee | null = null;

  constructor(
    private employeefacadeService: EmployeefacadeService,
  ) {}

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.initialize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  private initialize(): void {
    this.loadEmployeeTable();
  }

  // ===== Data Loading =====
  private loadEmployeeTable():void {
    this.employeefacadeService.loadEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.employees = data);
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
