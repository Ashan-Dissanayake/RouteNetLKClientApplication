import {Component, OnDestroy, OnInit} from '@angular/core';
import {Driver} from '../model/driver';
import {debounceTime, distinctUntilChanged, filter, forkJoin, Subject, switchMap, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatDivider} from '@angular/material/list';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouteFamiliarityLevel,} from '../model/routefamiliaritylevel';
import {CrewStatus} from '../model/crewstatus';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {DriverFacadeService} from '../driverfacade.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {
  DRIVER_FILTER_FORM_META, DRIVER_IMMUTABLE_CONTROLLERS_META, DRIVER_MAIN_FORM_META,
  DRIVER_TABLE_META
} from '../driver.meta';
import {Employee} from '../../employeemodule/model/employee';
import {LicenseCategory} from '../model/licensecategory';
import {FormUtils} from '../../../shared/component/form/form-util';
import {DriverMapper} from '../../../shared/mappers/DriverMapper';
import {VehicleImmutableControllersMeta} from '../../vehiclemodule/vehicle.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';


@Component({
  selector: 'app-crew',
  standalone:true,
  imports: [
    DataTableComponent,
    MatButton,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ButtonPanelComponent
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss'
})
export class DriverComponent implements OnInit,OnDestroy {

  // ===== Metadata & Configurations =====
  protected readonly tableColumns = DRIVER_TABLE_META;
  protected readonly filterFormMeta = DRIVER_FILTER_FORM_META;
  protected readonly mainFormMeta = DRIVER_MAIN_FORM_META;
  protected readonly actionPanelConfig = buildActionPanel({exclude: ['bulk-deactivate']});
  readonly immutableControllers = DRIVER_IMMUTABLE_CONTROLLERS_META;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  // --- Data ---
  protected drivers!: Driver[];
  protected routeFamiliarityLevels!: RouteFamiliarityLevel[];
  protected crewStatuses!: CrewStatus[];
  protected licenseCategories!: LicenseCategory[];
  protected employees!: Employee[];
  protected regexRules!: any;

  private destroy$ = new Subject<void>();

  protected dataInitialized = false;

  protected selectedRows = new Set<Driver>();
  protected activeRow: Driver | null = null;

  constructor(
    private driverFacadeService:DriverFacadeService,
    private formBuilder: FormbuilderService,
    private dialogService: DialogService
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
    forkJoin({
      crewStatuses: this.driverFacadeService.loadCrewStatuses(),
      routeFamiliarityLevels: this.driverFacadeService.loadRouteFamiliarityLevels(),
      licenseCategories:this.driverFacadeService.loadLicenseCategories(),
      employees:this.driverFacadeService.loadEmployeesByDesignation(),
      regexes:this.driverFacadeService.loadStaticRegexes()
    }).subscribe({
      next: data => this.handleMetadataLoad(data),
      error: (err) => this.dialogService.showError('Failed to load metadata.', err)
    });
    this.loadDriverTable();
  }

  private handleMetadataLoad(data: any): void {
    this.crewStatuses = data.crewStatuses;
    this.routeFamiliarityLevels = data.routeFamiliarityLevels;
    this.employees = data.employees;
    this.licenseCategories = data.licenseCategories;
    this.regexRules = data.regexes;

    this.dataInitialized = true;

    this.initializeMainForm();
    this.initializeFilterForm();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.formBuilder.build(this.filterFormMeta, {
      sscrewstatus:this.crewStatuses,
      ssroutefamilitylevel:this.routeFamiliarityLevels,
    });
    this.subscribeToFilterChanges();
  }

  private initializeMainForm(): void {
    this.mainForm = this.formBuilder.build(this.mainFormMeta, {
      employee:this.employees,
      licensecategory:this.licenseCategories,
      crewstatus:this.crewStatuses,
      routefamiliaritylevel:this.routeFamiliarityLevels,
      regexes: this.regexRules
    });
    this.bindLicenseNumberRegex();
  }

  // ===== Data Loading =====
  private loadDriverTable(): void {
    this.driverFacadeService.loadDrivers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.drivers = data);
  }

  // ===== Filtering =====
  private subscribeToFilterChanges(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filters: Record<string, any>) => {
        this.driverFacadeService.searchDriver(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => (this.drivers = data));
      });
  }

  // ===== CRUD =====
  protected  openMainForm(): void {
    this.mainForm.value.id?
      FormUtils.setFormControlsState(this.mainForm,this.immutableControllers,true):
      FormUtils.setFormControlsState(this.mainForm,this.immutableControllers,false);
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Driver' : 'Create Driver',
      form: this.mainForm,
      meta: this.mainFormMeta
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else{
        FormUtils.resetForm(this.mainForm);
      }
    });
  }

  private save(formData: any): void {
    const operation$ = formData.id
      ? this.driverFacadeService.updateDriver(formData)
      : this.driverFacadeService.createDriver(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showSuccess('Driver saved successfully.');
      },
      error: (err) =>{
        console.log(err)
        this.dialogService.showMessage({heading:'Failed to save Vehicle.', message:err.errorMessage})
      },
      complete:()=>{
        this.loadDriverTable();
        this.initializeMainForm();
        FormUtils.resetForm(this.mainForm);
        FormUtils.setFormControlsState(this.mainForm,this.immutableControllers,false);
      }
    });
  }

  private editRow(row: Driver): void {
    this.employees = this.drivers.map(driver => driver.employee);
    this.initializeMainForm();
    const  mappedRow = DriverMapper.toForm(row);
    this.mainForm.patchValue(mappedRow);
    this.openMainForm();
  }

  // ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeRow = row;
  }

  protected closeDetails(): void {
    this.activeRow = null;
  }

  protected onRowAction(action: string, row: any) {
    if (action === 'edit') this.editRow(row);
  }

  // Selection Handling
  protected onRowCheckboxChanged(event: CheckboxEvent):void {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean):void {
    this.selectedRows.clear();
    if (checked) this.drivers.forEach(row => this.selectedRows.add(row));
  }

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.filterForm.reset(),
    'create': () => this.openMainForm(),
  };

  protected onActionTriggered(event: ButtonClickEvent):void {
    const handler = this.actionHandlers[event.type];
    if (handler) handler();
    else this.dialogService.showWarning(`No handler defined for action: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent):void {
    const dropdownTypes = ['export-pdf', 'export-excel'];
    if (dropdownTypes.includes(event.type)) {
      this.actionHandlers[event.type]?.();
    } else {
      this.dialogService.showWarning(`Unhandled dropdown action: ${event.type}`);
    }
  }

  private bindLicenseNumberRegex():void{
    this.mainForm.controls['licensecategory'].valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(licenseCategory => !!licenseCategory?.name),
      switchMap(licenseCategory => this.driverFacadeService.loadDynamicRegexes(licenseCategory.name))
    ).subscribe(data => {
      const licenseNumber = this.mainForm.get('licensenumber');

      licenseNumber?.setValidators([Validators.pattern(data['licensenumber'].regex)]);
      licenseNumber?.updateValueAndValidity({ emitEvent: false });
    });
  }
}
