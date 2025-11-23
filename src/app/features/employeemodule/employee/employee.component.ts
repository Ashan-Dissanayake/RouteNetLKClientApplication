import {Component, OnDestroy, OnInit} from '@angular/core';
import {Employee} from '../model/employee';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {EmployeefacadeService} from '../employeefacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {
  EmployeeActionPanelMeta,
  EmployeeExportMeta,
  EmployeeFilterMeta,
  EmployeeFormMeta,
  EmployeeTableMeta
} from '../employee.meta';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Department} from '../model/department';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {ButtonClickEvent, ButtonPanelComponent} from '../../../shared/component/button-panel/button-panel.component';
import {Designation} from '../model/designation';
import {Employeestatus} from '../model/employeestatus';
import {Employeetype} from '../model/employeetype';
import {Gender} from '../model/gender';
import {Branch} from '../../branchmodule/model/branch';
import {FormUtils} from '../../../shared/component/form/form-util';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';

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
  readonly tableColumns = EmployeeTableMeta;
  readonly employeeFilterMeta = EmployeeFilterMeta;
  readonly actionPanelConfig = EmployeeActionPanelMeta;
  readonly employeeFormMeta = EmployeeFormMeta;
  readonly employeeExportMeta = EmployeeExportMeta;


  // ===== Form Controls =====
  employeeFilterForm: FormGroup = new FormGroup({});
  employeeForm: FormGroup = new FormGroup({});

  // --- Data ---
  employees!: Employee[];
  departments!: Department[];
  designations!: Designation[];
  employeeStatuses!: Employeestatus[];
  employeeTypes!: Employeetype[];
  genders!: Gender[];
  branches!: Branch[];
  regexRules!: any;

  dataInitialized = false;

  private destroy$ = new Subject<void>();

  selectedRows = new Set<Employee>();
  activeEmployee: Employee | null = null;

  constructor(
    private formBuilder: FormbuilderService,
    private employeefacadeService: EmployeefacadeService,
    private dialogService: DialogService
  ) {
  }

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
      designations: this.employeefacadeService.loadDesignations(),
      employeeTypes: this.employeefacadeService.loadEmployeeType(),
      employeeStatuses: this.employeefacadeService.loadEmployeestatus(),
      genders: this.employeefacadeService.loadGender(),
      branches: this.employeefacadeService.loadBranches(),
      regexes:this.employeefacadeService.loadRegexes()
    }).subscribe({
      next: data => this.handleMetadataLoad(data),
      error: (err) => this.dialogService.showError('Failed to load employee metadata.', err)
    });
    this.loadEmployeeTable();
  }

  private handleMetadataLoad(data: any): void {
    this.departments = data.departments;
    this.designations = data.designations;
    this.employeeTypes = data.employeeTypes;
    this.employeeStatuses = data.employeeStatuses;
    this.genders = data.genders;
    this.branches = data.branches;
    this.regexRules = data.regexes;

    this.dataInitialized = true;

    this.initializeForms();
    this.subscribeToFilterChanges();

  }

  private initializeForms(): void {
    this.employeeFilterForm = this.formBuilder.build(this.employeeFilterMeta, {
      ssdepartment: this.departments
    });

    this.employeeForm = this.formBuilder.build(this.employeeFormMeta, {
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

  private configureActionPanel(): void {
    this.actionPanelConfig.forEach(btn => {
      if (btn.type === 'bulk-deactivate') {
        btn.disabled = () => this.selectedRows.size === 0;
      }
    });
  }

  // ===== Data Loading =====
  private loadEmployeeTable(): void {
    this.employeefacadeService.loadEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.employees = data);
  }

  // ===== Filtering =====
  private subscribeToFilterChanges(): void {
    this.employeeFilterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filters: Record<string, any>) => {
        this.employeefacadeService.searchEmployees(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => (this.employees = data));
      });
  }


  // ===== CRUD =====
  openEmployeeForm(): void {
    this.dialogService.showFormPopup({
      heading: this.employeeForm.value.id ? 'Edit Employee' : 'Create Employee',
      form: this.employeeForm,
      meta: this.employeeFormMeta
    }).subscribe(formData => {
      if (formData) this.saveEmployee(formData);
      else FormUtils.resetForm(this.employeeForm);
    });
  }

  private saveEmployee(formData: any): void {
    const operation$ = formData.id
      ? this.employeefacadeService.updateEmployee(formData)
      : this.employeefacadeService.createEmployee(formData);

    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showSuccess('Employee saved successfully.');
        this.loadEmployeeTable();
        FormUtils.resetForm(this.employeeForm);
      },
      error: (err) =>{
        console.log(err)
        this.dialogService.showMessage({heading:'Failed to save employee.', message:err.errorMessage})
      }
    });
  }

  editEmployee(row: Employee): void {
    console.log(this.employeeForm)

    this.disableControllerOnEdit();
    this.employeeForm.patchValue(row);
    this.openEmployeeForm();
  }

  deactivateSelectedEmployees() {
    const toDeactivate = Array.from(this.selectedRows);
    this.dialogService.showConfirmation({
      heading: "Deactivation",
      message: "Are sure ?"
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.employeefacadeService.deleteEmployees(toDeactivate)
        ?.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Selected employees deactivated.');
            this.selectedRows.clear();
            this.loadEmployeeTable();
          },
          error: (err) => this.dialogService.showError('Failed to deactivate employees.', err)
        });
    })
  }

  setGender(){
    this.employeeForm.controls['nic'].valueChanges.subscribe((nic) => {
      const nicControl = this.employeeForm.get('nic');
      if (nicControl?.valid) {
        const gender = this.employeefacadeService.extractGenderFromNIC(nic);
        if (gender) {
          let bindedGender = this.genders.find((gen)=> gen.name.toLowerCase() == gender.toLowerCase());
          this.employeeForm.controls['gender'].setValue(bindedGender);
        }
      }
    });
  }

  setEmail(){
   this.employeeForm.controls['callingname'].valueChanges.subscribe(()=>{
     const callingName = this.employeeForm.controls['callingname'].getRawValue();
     const employeeNumber = this.employeeForm.controls['number'].getRawValue();
     const callingnameControl = this.employeeForm.get('callingname');
     if (callingnameControl?.valid){
       const email = this.employeefacadeService.generateEmail(callingName,employeeNumber);
       if (email){
         this.employeeForm.controls['email'].setValue(email);
       }
     }
   });
  }

  disableControllerOnEdit(){
    this.disableNumber();
    this.disableDatePicker();
  }

  disableDatePicker(){
    this.employeeForm.controls['doj'].disable({onlySelf:true})
  }

  disableNumber(){
    this.employeeForm.controls['number'].disable({onlySelf:true})
  }

  // ===== Export Operations =====
  exportSelectedToPdf() {
    if (this.selectedRows.size > 0) {
      this.dialogService.showPrintDialog({
        width:'1500px',
        height:'650px',
        title: 'Employee Details',
        mode: 'table',
        data: Array.from(this.selectedRows),
        columns: this.employeeExportMeta
      }).subscribe((result) => {
        if (result) {
          this.selectedRows = new Set<Employee>();
        }
      });
    } else {
      this.dialogService.showWarning('Please select at least one record to print.');
    }
  }

  exportSelectedToExcel(): void {
    const selectedArray = Array.from(this.selectedRows);

    let isExported = exportToExcel(
      selectedArray,
      this.employeeExportMeta,
      'selected-employees.xlsx'
    );

    if (!isExported) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return
    }
  }

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.employeeFilterForm.reset(),
    'create': () => this.openEmployeeForm(),
    'bulk-deactivate': () => this.deactivateSelectedEmployees(),
    'export-pdf': () => this.exportSelectedToPdf(),
    'export-excel': () => this.exportSelectedToExcel()
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

  onRowAction(action: string, row: any) {
    if (action === 'edit') this.editEmployee(row);
  }

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
