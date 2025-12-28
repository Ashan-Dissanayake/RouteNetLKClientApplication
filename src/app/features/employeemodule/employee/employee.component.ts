import {Component, OnDestroy, OnInit} from '@angular/core';
import {Employee} from '../model/employee';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {EmployeeFacadeService} from '../employeefacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {
  EMPLOYEE_DATA_EXPORT_META,
  EMPLOYEE_FILTER_FORM_META, EMPLOYEE_IMMUTABLE_CONTROLLERS_META, EMPLOYEE_MAIN_FORM_META,
  EMPLOYEE_TABLE_META,
} from '../employee.meta';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Department} from '../model/department';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {Designation} from '../model/designation';
import {Employeestatus} from '../model/employeestatus';
import {Employeetype} from '../model/employeetype';
import {Gender} from '../model/gender';
import {Branch} from '../../branchmodule/model/branch';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';

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
  protected readonly tableColumns = EMPLOYEE_TABLE_META;
  protected readonly filterFormMeta = EMPLOYEE_FILTER_FORM_META;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly mainFormMeta = EMPLOYEE_MAIN_FORM_META;
  protected readonly immutableControllers = EMPLOYEE_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta = EMPLOYEE_DATA_EXPORT_META;

  // ===== Form Controls =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  // --- Data ---
  protected employees!: Employee[];
  protected departments!: Department[];
  protected designations!: Designation[];
  protected employeeStatuses!: Employeestatus[];
  protected employeeTypes!: Employeetype[];
  protected genders!: Gender[];
  protected branches!: Branch[];
  protected regexRules!: any;

  protected dataInitialized = false;

  private destroy$ = new Subject<void>();

  protected selectedRows = new Set<Employee>();
  protected activeEmployee: Employee | null = null;

  constructor(
    private formBuilderService: FormbuilderService,
    private employeeFacadeService: EmployeeFacadeService,
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
      departments: this.employeeFacadeService.loadDepartments(),
      designations: this.employeeFacadeService.loadDesignations(),
      employeeTypes: this.employeeFacadeService.loadEmployeeType(),
      employeeStatuses: this.employeeFacadeService.loadEmployeeStatus(),
      genders: this.employeeFacadeService.loadGenders(),
      branches: this.employeeFacadeService.loadBranches(),
      regexes:this.employeeFacadeService.loadStaticRegexes()
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
    this.departments = data.departments;
    this.designations = data.designations;
    this.employeeTypes = data.employeeTypes;
    this.employeeStatuses = data.employeeStatuses;
    this.genders = data.genders;
    this.branches = data.branches;
    this.regexRules = data.regexes;

    this.dataInitialized = true;

    this.createMainForm();
    this.createFilterForm();
  }

  private createFilterForm(): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      ssdepartment: this.departments
    });
    this.onFilterFormChanged();
  }

  private createMainForm(): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      gender: this.genders,
      branch: this.branches,
      department: this.departments,
      designation: this.designations,
      employeetype: this.employeeTypes,
      employeestatus: this.employeeStatuses,
      regexes: this.regexRules
    });

    this.setGender();
    this.setEmail();
  }

  private setGender():void{
    this.mainForm.controls['nic'].valueChanges.subscribe((nic) => {
      const nicControl = this.mainForm.get('nic');
      if (nicControl?.valid) {
        const gender = this.employeeFacadeService.extractGenderFromNIC(nic);
        if (gender) {
          let bindedGender = this.genders.find((gen)=> gen.name.toLowerCase() == gender.toLowerCase());
          this.mainForm.controls['gender'].setValue(bindedGender);
        }
      }
    });
  }

  private setEmail():void{
    this.mainForm.controls['callingname'].valueChanges.subscribe(()=>{
      const callingName = this.mainForm.controls['callingname'].getRawValue();
      const employeeNumber = this.mainForm.controls['number'].getRawValue();
      const callingnameControl = this.mainForm.get('callingname');
      if (callingnameControl?.valid){
        const email = this.employeeFacadeService.generateEmail(callingName,employeeNumber);
        if (email){
          this.mainForm.controls['email'].setValue(email);
        }
      }
    });
  }

  // ===== Data Loading =====
  private loadTable(): void {
    this.employeeFacadeService.loadEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.employees = data);
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.mainForm.value.id?
    this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,true):
    this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,false);
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Employee' : 'Create Employee',
      form: this.mainForm,
      meta: this.mainFormMeta
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = formData.id
      ? this.employeeFacadeService.updateEmployee(formData)
      : this.employeeFacadeService.createEmployee(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showSuccess('Employee saved successfully.');
      },
      error: (err) =>{
        this.dialogService.showMessage({heading:'Failed to save employee.', message:err.errorMessage})
      },
      complete:()=>{
        this.loadTable();
        this.formBuilderService.resetForm(this.mainForm);
        this.formBuilderService.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private edit(row: Employee): void {
    this.mainForm.patchValue(row);
    this.openMainForm();
  }

  private deactivateSelectedRows():void {
    const toDeactivate = Array.from(this.selectedRows);
    this.dialogService.showConfirmation({
      heading: "Deactivation",
      message: "Are sure ?"
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.employeeFacadeService.deleteEmployees(toDeactivate)
        ?.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialogService.showSuccess('Selected employees deactivated.'),
          error: (err) => this.dialogService.showError('Failed to deactivate employees.', err),
          complete:()=>{
            this.selectedRows.clear();
            this.loadTable();
          }
        });
    })
  }

  // ===== Export Operations =====
  protected toPdf() {
    if (this.selectedRows.size > 0) {
      this.dialogService.showPrintDialog({
        width:'1500px',
        height:'650px',
        title: 'Employee Details',
        mode: 'table',
        data: Array.from(this.selectedRows),
        columns: this.exportMeta
      }).subscribe((result) => {
        if (result) {
          this.selectedRows = new Set<Employee>();
        }
      });
    } else {
      this.dialogService.showWarning('Please select at least one record to print.');
    }
  }

  protected toExcel(): void {
    const selectedArray = Array.from(this.selectedRows);

    let isExported = exportToExcel(
      selectedArray,
      this.exportMeta,
      'selected-employees.xlsx'
    );

    if (!isExported) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return
    }
  }

  // ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeEmployee = row;
  }

  protected onCloseDetailView(): void {
    this.activeEmployee = null;
  }

  protected onRowAction(action: string, row: any) {
    if (action === 'edit') this.edit(row);
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((filters: Record<string, any>) => {
        this.employeeFacadeService.searchEmployees(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => (this.employees = data));
      });
  }

  // ===== Selection Handling =====
  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.employees.forEach(row => this.selectedRows.add(row));
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
