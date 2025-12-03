import {Component, OnDestroy, OnInit} from '@angular/core';
import {VehicleActionPanelMeta, VehicleFilterMeta, VehicleTableMeta} from '../vehicle.meta';
import {Vehicle} from '../model/vehicle';
import {VehiclefacadeService} from '../vehiclefacade.service';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Servicetype} from '../model/servicetype';
import {Conditionrate} from '../model/conditionrate';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';

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
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
  ],
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent implements OnInit,OnDestroy{
  // ===== Metadata & Configurations =====
  readonly tableColumns = VehicleTableMeta;
  readonly vehicleFilterMeta = VehicleFilterMeta;
  readonly actionPanelConfig = VehicleActionPanelMeta;

  // ===== Form Controls =====
  vehicleFilterForm: FormGroup = new FormGroup({});

  // --- Data ---
  vehicles!: Vehicle[];
  servicetypes!: Servicetype[];
  conditionrates!: Conditionrate[];

  dataInitialized = false;

  private destroy$ = new Subject<void>();

  selectedRows = new Set<Vehicle>();
  activeVehicle: Vehicle | null = null;

  constructor(
    private vehicleFacadeService:VehiclefacadeService,
    private formBuilder: FormbuilderService,
    private dialogService: DialogService
  ) { }

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
      servicetypes: this.vehicleFacadeService.loadServicetypes(),
      conditionrates: this.vehicleFacadeService.loadConditionrates(),
    }).subscribe({
      next: data => this.handleMetadataLoad(data),
      error: (err) => this.dialogService.showError('Failed to load vehicle metadata.', err)
    });
    this.loadVehicleTable();
  }

  private handleMetadataLoad(data: any): void {
    this.servicetypes = data.servicetypes;
    this.conditionrates = data.conditionrates;

    this.dataInitialized = true;

    this.initializeForms();
    this.subscribeToFilterChanges();
  }

  private initializeForms(): void {
    this.vehicleFilterForm = this.formBuilder.build(this.vehicleFilterMeta, {
      sservicetype: this.servicetypes,
      ssconditionrate:this.conditionrates
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
  private loadVehicleTable(): void {
    this.vehicleFacadeService.loadVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.vehicles = data);
  }

  // ===== Filtering =====
  private subscribeToFilterChanges(): void {
    this.vehicleFilterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filters: Record<string, any>) => {
        this.vehicleFacadeService.searchVehicle(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => (this.vehicles = data));
      });
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

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.vehicleFilterForm.reset(),
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

}
