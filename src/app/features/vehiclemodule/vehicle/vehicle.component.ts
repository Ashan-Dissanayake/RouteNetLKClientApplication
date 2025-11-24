import {Component, OnInit} from '@angular/core';
import {VehicleTableMeta} from '../vehicle.meta';
import {Vehicle} from '../model/vehicle';
import {VehiclefacadeService} from '../vehiclefacade.service';
import {Subject, takeUntil} from 'rxjs';
import {EmployeeTableMeta} from '../../employeemodule/employee.meta';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {Employee} from '../../employeemodule/model/employee';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  standalone: true,
  imports: [
    DataTableComponent,
    MatButton,
    MatIcon,
    TableCellDirective,
    SideViewComponent,
    NgClass,
    MatDivider,
  ],
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent implements OnInit{
  // ===== Metadata & Configurations =====
  readonly tableColumns = VehicleTableMeta;

  // --- Data ---
  vehicles!: Vehicle[];

  private destroy$ = new Subject<void>();

  selectedRows = new Set<Vehicle>();
  activeVehicle: Vehicle | null = null;



  constructor(
    private vehicleFacadeService:VehiclefacadeService
  ) { }

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.initialize();
  }

  // ===== Initialization =====
  private initialize(): void {
    this.loadVehicleTable();
  }

  // ===== Data Loading =====
  private loadVehicleTable(): void {
    this.vehicleFacadeService.loadVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.vehicles = data);
  }

  // ===== Table Selection =====
  onRowClick(row: any): void {
    this.activeVehicle = row;
  }

  closeDetails(): void {
    this.activeVehicle = null;
  }

  onRowAction(action: string, row: any) {
  }

  // Selection Handling
  onRowCheckboxChanged(event: CheckboxEvent<any>) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.vehicles.forEach(row => this.selectedRows.add(row));
  }


  protected readonly document = document;
}
