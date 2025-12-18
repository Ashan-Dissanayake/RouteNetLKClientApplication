import {Component, OnDestroy, OnInit} from '@angular/core';
import {DriverTableMeta} from '../crew.meta';
import {Driver} from '../model/driver';
import {CrewfacadeService} from '../crewfacade.service';
import {Subject, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatDivider} from '@angular/material/list';
import {NgClass} from '@angular/common';


@Component({
  selector: 'app-crew',
  imports: [
    DataTableComponent,
    MatButton,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    MatDivider,
    NgClass
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss'
})
export class DriverComponent implements OnInit,OnDestroy {

  // ===== Metadata & Configurations =====
  protected  readonly tableColumns = DriverTableMeta;

  // --- Data ---
  protected drivers!: Driver[];

  private destroy$ = new Subject<void>();

  selectedRows = new Set<Driver>();
  protected activeDriver: Driver | null = null;


  constructor(
    private crewFacadeService:CrewfacadeService
  ) {
  }

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
    this.loadDriverTable();
  }

  // ===== Data Loading =====
  private loadDriverTable(): void {
    this.crewFacadeService.loadDrivers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.drivers = data);
  }

  // ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeDriver = row;
  }

  protected closeDetails(): void {
    this.activeDriver = null;
  }

  protected onRowAction(action: string, row: any) { }

  // Selection Handling
  protected onRowCheckboxChanged(event: CheckboxEvent<any>) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.drivers.forEach(row => this.selectedRows.add(row));
  }

}
