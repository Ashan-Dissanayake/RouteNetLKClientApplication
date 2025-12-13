import {Component, OnDestroy, OnInit} from '@angular/core';
import {VehicleActionPanelMeta, VehicleFilterMeta, VehicleFormMeta, VehicleTableMeta} from '../vehicle.meta';
import {Vehicle} from '../model/vehicle';
import {VehiclefacadeService} from '../vehiclefacade.service';
import {debounceTime, distinctUntilChanged, filter, forkJoin, Subject, switchMap, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Servicetype} from '../model/servicetype';
import {Conditionrate} from '../model/conditionrate';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {Vehiclestatus} from '../model/vehiclestatus';
import {Make} from '../model/make';
import {Fueltype} from '../model/fueltype';
import {Seatingcapacity} from '../model/seatingcapacity';
import {Employee} from '../../employeemodule/model/employee';
import {Branch} from '../../branchmodule/model/branch';
import {FormUtils} from '../../../shared/component/form/form-util';

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
  readonly vehicleFormMeta = VehicleFormMeta;

  // ===== Form Controls =====
  vehicleFilterForm: FormGroup = new FormGroup({});
  vehicleForm: FormGroup = new FormGroup({});

  // --- Data ---
  vehicles!: Vehicle[];
  servicetypes!: Servicetype[];
  vehiclestatuses!: Vehiclestatus[];
  makes!: Make[];
  fueltypes!: Fueltype[];
  conditionrates!: Conditionrate[];
  seatingcapacities!: Seatingcapacity[];
  employees!: Employee[];
  branches!: Branch[];
  regexRules!: any;

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
      vehiclestatuses: this.vehicleFacadeService.loadVehiclesatuses(),
      conditionrates: this.vehicleFacadeService.loadConditionrates(),
      makes:this.vehicleFacadeService.loadMakes(),
      fueltypes:this.vehicleFacadeService.loadFueltypes(),
      seatingcapacities:this.vehicleFacadeService.laodSeatingcapacities(),
      employees:this.vehicleFacadeService.loadEmployees(),
      branches:this.vehicleFacadeService.loadBranches(),
      regexes:this.vehicleFacadeService.loadStaticRegexes()
    }).subscribe({
      next: data => this.handleMetadataLoad(data),
      error: (err) => this.dialogService.showError('Failed to load vehicle metadata.', err)
    });
    this.loadVehicleTable();
  }

  private handleMetadataLoad(data: any): void {
    this.servicetypes = data.servicetypes;
    this.vehiclestatuses = data.vehiclestatuses;
    this.makes = data.makes;
    this.fueltypes = data.fueltypes;
    this.conditionrates = data.conditionrates;
    this.seatingcapacities = data.seatingcapacities;
    this.employees = data.employees;
    this.branches = data.branches;
    this.regexRules = data.regexes;

    this.dataInitialized = true;

    this.initializeForms();
    this.subscribeToFilterChanges();
  }

  private initializeForms(): void {
    this.vehicleFilterForm = this.formBuilder.build(this.vehicleFilterMeta, {
      sservicetype: this.servicetypes,
      ssconditionrate:this.conditionrates
    });

    this.vehicleForm = this.formBuilder.build(this.vehicleFormMeta, {
      servicetype: this.servicetypes,
      vehiclestatus:this.vehiclestatuses,
      make:this.makes,
      fueltype:this.fueltypes,
      conditionrate:this.conditionrates,
      seatingcapacity:this.seatingcapacities,
      employee:this.employees,
      branch:this.branches,
      regexes: this.regexRules
    });
    this.bindChassisAndEngineRegex();
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

  // ===== CRUD =====
  openVehicleForm(): void {
    this.dialogService.showFormPopup({
      heading: this.vehicleForm.value.id ? 'Edit Vehicle' : 'Create Vehicle',
      form: this.vehicleForm,
      meta: this.vehicleFormMeta
    }).subscribe(formData => {
      if (formData) this.saveVehicle(formData);
      else{
        FormUtils.resetForm(this.vehicleForm);
      }
    });
  }

  private saveVehicle(formData: any): void {
    const operation$ = formData.id
      ? this.vehicleFacadeService.updateVehicle(formData)
      : this.vehicleFacadeService.createVehicle(formData);

    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showSuccess('Vehicle saved successfully.');
        this.loadVehicleTable();
        FormUtils.resetForm(this.vehicleForm);
        this.setFormControlsStateOnCreate();
      },
      error: (err) =>{
        console.log(err)
        this.dialogService.showMessage({heading:'Failed to save Vehicle.', message:err.errorMessage})
      }
    });
  }

  editVehicle(row: Vehicle): void {
    this.setFormControlsStateOnEdit();

    const normalizedRow = FormUtils.normalizeObject(row,  [
      { from: 'seatingcapacity.make', to: 'make', remove: false }
    ]);

    this.vehicleForm.patchValue(normalizedRow);
    this.openVehicleForm();
  }

  private bindChassisAndEngineRegex(){
    this.vehicleForm.controls['make'].valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(make => !!make?.name),
      switchMap(make => this.vehicleFacadeService.loadDynamicRegexes(make.name))
    ).subscribe(data => {
      const chassis = this.vehicleForm.get('chasisnumber');
      const engine = this.vehicleForm.get('enginenumber');

      chassis?.setValidators([Validators.pattern(data['chasisnumber'].regex)]);
      chassis?.updateValueAndValidity({ emitEvent: false });

      engine?.setValidators([Validators.pattern(data['enginenumber'].regex)]);
      engine?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private setFormControlsStateOnEdit(){
    FormUtils.setFormControlsState(this.vehicleForm, [
        'make', 'code', 'number', 'yom', 'dob',
        'chasisnumber', 'enginenumber', 'mileage',
        'seatingcapacity', 'employee', 'branch'
      ], true);
  }

  private setFormControlsStateOnCreate(){
    FormUtils.setFormControlsState(this.vehicleForm, [
        'make', 'code', 'number', 'yom', 'dob',
        'chasisnumber', 'enginenumber', 'mileage',
        'seatingcapacity', 'employee', 'branch'
      ], false);
  }

  // ===== Table Selection =====
  onRowClick(row: any): void {
    this.activeVehicle = row;
  }

  closeDetails(): void {
    this.activeVehicle = null;
  }

  onRowAction(action: string, row: any) {
    if (action === 'edit') this.editVehicle(row);
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
    'create': () => this.openVehicleForm(),
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
