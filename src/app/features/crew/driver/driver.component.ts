import {Component, OnDestroy, OnInit} from '@angular/core';
import {Driver} from '../entity/driver';
import {debounceTime, distinctUntilChanged, filter, forkJoin, Subject, switchMap, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatDivider} from '@angular/material/list';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouteFamiliarityLevel,} from '../entity/routefamiliaritylevel';
import {CrewStatus} from '../entity/crewstatus';
import {DialogService} from '../../../core/dialog.service';
import {DriverFacadeService} from '../driverfacade.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {
  DRIVER_DATA_EXPORT_META,
  DRIVER_FILTER_FORM_META, DRIVER_IMMUTABLE_CONTROLLERS_META, DRIVER_MAIN_FORM_META,
  DRIVER_TABLE_META
} from '../driver.meta';
import {Employee} from '../../employeemodule/entity/employee';
import {LicenseCategory} from '../entity/licensecategory';
import {DriverMapper} from '../../../shared/mappers/DriverMapper';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {FormbuilderService} from '../../../core/formbuilder.service';

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
  protected readonly actionPanelConfig = buildActionPanel({exclude: ['bulk-deactivate']});
  protected readonly mainFormMeta = DRIVER_MAIN_FORM_META;
  protected readonly immutableControllers = DRIVER_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta = DRIVER_DATA_EXPORT_META;

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

  protected dataInitialized = false;

  private destroy$ = new Subject<void>();

  protected selectedRows = new Set<Driver>();
  protected activeRow: Driver | null = null;

  constructor(
    private driverFacadeService:DriverFacadeService,
    private formBuilderService: FormbuilderService,
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
    this.crewStatuses = data.crewStatuses;
    this.routeFamiliarityLevels = data.routeFamiliarityLevels;
    this.employees = data.employees;
    this.licenseCategories = data.licenseCategories;
    this.regexRules = data.regexes;

    this.dataInitialized = true;

    this.createMainForm();
    this.createFilterForm();
  }

  private createFilterForm(): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      sscrewstatus:this.crewStatuses,
      ssroutefamilitylevel:this.routeFamiliarityLevels,
    });
    this.onFilterFormChanged();
  }

  private createMainForm(): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      employee:this.employees,
      licensecategory:this.licenseCategories,
      crewstatus:this.crewStatuses,
      routefamiliaritylevel:this.routeFamiliarityLevels,
      regexes: this.regexRules
    });
    this.bindLicenseNumberRegex();
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

  // ===== Data Loading =====
  private loadTable(): void {
    this.driverFacadeService.loadDrivers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.drivers = data);
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.mainForm.value.id?
      this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,true):
      this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,false);
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Driver' : 'Create Driver',
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
      ? this.driverFacadeService.updateDriver(formData)
      : this.driverFacadeService.createDriver(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showSuccess('Driver saved successfully.');
      },
      error: (err) =>{
        this.dialogService.showMessage({heading:'Failed to save Driver.', message:err.errorMessage})
      },
      complete:()=>{
        this.loadTable();
        this.createMainForm();
        this.formBuilderService.resetForm(this.mainForm);
        this.formBuilderService.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private edit(row: Driver): void {
    this.employees = this.drivers.map(driver => driver.employee);
    this.createMainForm();
    const  mappedRow = DriverMapper.toForm(row);
    this.mainForm.patchValue(mappedRow);
    this.openMainForm();
  }

  // ===== Export Operations =====
  private toPdf():void {
    if (this.selectedRows.size > 0) {
      this.dialogService.showPrintDialog({
        width:'1500px',
        height:'650px',
        title: 'Driver Details',
        mode: 'table',
        data: Array.from(this.selectedRows),
        columns: this.exportMeta
      }).subscribe((result) => {
        if (result) {
          this.selectedRows = new Set<Driver>();
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
      'selected-drivers.xlsx'
    );

    if (!isExported) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return
    }
  }

  // ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeRow = row;
  }

  protected onCloseDetailView(): void {
    this.activeRow = null;
  }

  protected onRowAction(action: string, row: any):void {
    if (action === 'edit') this.edit(row);
  }

  // ===== Selection Handling =====
  protected onRowCheckboxChanged(event: CheckboxEvent):void {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean):void {
    this.selectedRows.clear();
    if (checked) this.drivers.forEach(row => this.selectedRows.add(row));
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((filters: Record<string, any>) => {
        this.driverFacadeService.searchDriver(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => (this.drivers = data));
      });
  }

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.filterForm.reset(),
    'create': () => this.openMainForm(),
    'export-pdf': () => this.toPdf(),
    'export-excel': () => this.toExcel()
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

}
