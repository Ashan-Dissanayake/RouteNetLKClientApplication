import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  VEHICLE_DATA_EXPORT_META,
  VEHICLE_FILTER_FORM_META, VEHICLE_IMMUTABLE_CONTROLLERS_META, VEHICLE_MAIN_FORM_META,
  VEHICLE_TABLE_META

} from '../vehicle.meta';
import {Vehicle} from '../entity/vehicle';
import {VehicleFacadeService} from '../vehiclefacade.service';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Conditionrate} from '../entity/conditionrate';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {Vehiclestatus} from '../entity/vehiclestatus';
import {Make} from '../entity/make';
import {Fueltype} from '../entity/fueltype';
import {Branch} from '../../branchmodule/entity/branch';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {Model} from '../entity/model';
import {Bustype} from '../entity/bustype';

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
  protected readonly tableColumns = VEHICLE_TABLE_META;
  protected readonly filterFormMeta = VEHICLE_FILTER_FORM_META;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly mainFormMeta = VEHICLE_MAIN_FORM_META;
  protected readonly immutableControllers = VEHICLE_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta = VEHICLE_DATA_EXPORT_META;

  // ===== Form Controls =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  // --- Data ---
  protected vehicles!: Vehicle[];
  protected vehicleStatuses!: Vehiclestatus[];
  protected makes!: Make[];
  protected models!: Model[];
  protected fuelTypes!: Fueltype[];
  protected busTypes!: Bustype[];
  protected conditionRates!: Conditionrate[];
  protected branches!: Branch[];
  protected regexRules!: any;

  protected dataInitialized = false;

  private destroy$ = new Subject<void>();

  protected selectedRows = new Set<Vehicle>();
  protected activeVehicle: Vehicle | null = null;

  constructor(
    private vehicleFacadeService:VehicleFacadeService,
    private formBuilderService: FormbuilderService,
    private dialogService: DialogService
  ) { }

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
    forkJoin({
      vehicleStatuses: this.vehicleFacadeService.loadVehicleStatuses(),
      conditionRates: this.vehicleFacadeService.loadConditionRates(),
      makes:this.vehicleFacadeService.loadMakes(),
      models:this.vehicleFacadeService.loadModels(),
      fuelTypes:this.vehicleFacadeService.loadFuelTypes(),
      busTypes:this.vehicleFacadeService.loadBusTypes(),
      branches:this.vehicleFacadeService.loadBranches(),
      regexes:this.vehicleFacadeService.loadStaticRegexes()
    }).subscribe({
      next: data => this.loadMetaData(data),
      error: (err) => this.dialogService.showError('Failed to load metadata.', err),
      complete:()=>{
        this.loadTable();
        this.createMainForm();
        this.createFilterForm();
      }
    });
  }

  private loadMetaData(data: any): void {
    this.vehicleStatuses = data.vehicleStatuses;
    this.makes = data.makes;
    this.fuelTypes = data.fuelTypes;
    this.busTypes = data.busTypes;
    this.conditionRates = data.conditionRates;
    this.models = data.models;
    this.branches = data.branches;
    this.regexRules = data.regexes;

    this.dataInitialized = true;
  }

  private createFilterForm(): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      ssconditionrate:this.conditionRates,
      ssbustype:this.busTypes,
    });
    this.onFilterFormChanged();
  }

  private createMainForm(): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      vehiclestatus:this.vehicleStatuses,
      make:this.makes,
      fueltype:this.fuelTypes,
      bustype:this.busTypes,
      conditionrate:this.conditionRates,
      model:this.models,
      branch:this.branches,
      regexes: this.regexRules
    });
  }


  // ===== Data Loading =====
  private loadTable(): void {
    this.vehicleFacadeService.loadVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.vehicles = data);
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.mainForm.value.id?
      this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,true):
      this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,false);
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Vehicle' : 'Create Vehicle',
      form: this.mainForm,
      meta: this.mainFormMeta
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else{
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private save(formData: any): void {
    const operation$ = formData.id
      ? this.vehicleFacadeService.updateVehicle(formData)
      : this.vehicleFacadeService.createVehicle(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Vehicle saved successfully.'),
      error: (err) =>this.dialogService.showMessage({heading:'Failed to save Vehicle.', message:err.errorMessage}),
      complete:()=>{
        this.loadTable();
        this.createMainForm();
        this.formBuilderService.resetForm(this.mainForm);
        this.formBuilderService.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private edit(row: Vehicle): void {
    //this.setFormControlsStateOnEdit();
    const normalizedRow = this.formBuilderService.mapNestedValues(row,  [
      { from: 'seatingcapacity.make', to: 'make', remove: false }
    ]);
    this.mainForm.patchValue(normalizedRow);
    this.openMainForm();
  }

  private deactivateSelectedRows():void {
    const toDeactivate = Array.from(this.selectedRows);
    this.dialogService.showConfirmation({
      heading: "Deactivation",
      message: "Are sure ?"
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.vehicleFacadeService.deleteVehicles(toDeactivate)
        ?.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialogService.showSuccess('Selected vehicles deactivated.'),
          error: (err) => this.dialogService.showError('Failed to deactivate vehicles.', err),
          complete:()=>{
            this.selectedRows.clear();
            this.loadTable();
          }
        });
    })
  }

  // ===== Export Operations =====
  private toPdf():void {
    if (this.selectedRows.size > 0) {
      this.dialogService.showPrintDialog({
        width:'1500px',
        height:'650px',
        title: 'Vehicle Details',
        mode: 'table',
        data: Array.from(this.selectedRows),
        columns: this.exportMeta
      }).subscribe((result) => {
        if (result) {
          this.selectedRows = new Set<Vehicle>();
        }
      });
    } else {
      this.dialogService.showWarning('Please select at least one record to print.');
    }
  }

  private toExcel(): void {
    const selectedArray = Array.from(this.selectedRows);

    let isExported = exportToExcel(
      selectedArray,
      this.exportMeta,
      'selected-vehicles.xlsx'
    );

    if (!isExported) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return
    }
  }

  // ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeVehicle = row;
  }

  protected onCloseDetailView(): void {
    this.activeVehicle = null;
  }

  protected onRowAction(action: string, row: any) {
    if (action === 'edit') this.edit(row);
  }

  // ===== Selection Handling =====
  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.vehicles.forEach(row => this.selectedRows.add(row));
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((filters: Record<string, any>) => {
        this.vehicleFacadeService.searchVehicles(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => (this.vehicles = data));
      });
  }

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.filterForm.reset(),
    'create': () => this.openMainForm(),
    'bulk-deactivate': () => this.deactivateSelectedRows(),
    'export-pdf': () => this.toPdf(),
    'export-excel': () => this.toExcel()
  };

  protected onActionTriggered(event: ButtonClickEvent) {
    const handler = this.actionHandlers[event.type];
    if (handler) handler();
    else this.dialogService.showWarning(`No handler defined for action: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent) {
    const dropdownTypes = ['export-pdf', 'export-excel'];
    if (dropdownTypes.includes(event.type)) {
      this.actionHandlers[event.type]?.();
    } else {
      this.dialogService.showWarning(`Unhandled dropdown action: ${event.type}`);
    }
  }

}
