import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  CONDUCTOR_DATA_EXPORT_META,
  CONDUCTOR_FILTER_FORM_META,
  CONDUCTOR_IMMUTABLE_CONTROLLERS_META, CONDUCTOR_MAIN_FORM_META,
  CONDUCTOR_TABLE_META
} from '../conductor.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Conductor} from '../entity/conductor';
import {RouteFamiliarityLevel} from '../entity/routefamiliaritylevel';
import {CrewStatus} from '../entity/crewstatus';
import {Employee} from '../../employeemodule/entity/employee';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {ConductorFacadeService} from '../conductorfacade.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {ConductorMapper} from '../../../shared/mappers/ConductorMapper';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-conductor',
  standalone:true,
  imports: [
    ButtonPanelComponent,
    DataTableComponent,
    DynamicFieldComponent,
    MatButton,
    MatDivider,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass
  ],
  templateUrl: './conductor.component.html',
  styleUrl: './conductor.component.scss'
})
export class ConductorComponent implements OnInit,OnDestroy {

  // ===== Metadata & Configurations =====
  protected readonly tableColumns = CONDUCTOR_TABLE_META;
  protected readonly filterFormMeta = CONDUCTOR_FILTER_FORM_META;
  protected readonly actionPanelConfig = buildActionPanel({exclude: ['bulk-deactivate']});
  protected readonly mainFormMeta = CONDUCTOR_MAIN_FORM_META;
  protected readonly immutableControllers = CONDUCTOR_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta = CONDUCTOR_DATA_EXPORT_META;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  // --- Data ---
  protected conductors!: Conductor[];
  protected routeFamiliarityLevels!: RouteFamiliarityLevel[];
  protected crewStatuses!: CrewStatus[];
  protected employees!: Employee[];
  protected regexRules!: any;

  protected dataInitialized = false;

  private destroy$ = new Subject<void>();

  protected selectedRows = new Set<Conductor>();
  protected activeRow: Conductor | null = null;

  constructor(
    private conductorFacadeService:ConductorFacadeService,
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
      crewStatuses: this.conductorFacadeService.loadCrewStatuses(),
      routeFamiliarityLevels: this.conductorFacadeService.loadRouteFamiliarityLevels(),
      employees:this.conductorFacadeService.loadEmployeesByDesignation(),
      regexes:this.conductorFacadeService.loadStaticRegexes()
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
      crewstatus:this.crewStatuses,
      routefamiliaritylevel:this.routeFamiliarityLevels,
      regexes: this.regexRules
    });
  }

  // ===== Data Loading =====
  private loadTable(): void {
    this.conductorFacadeService.loadConductors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.conductors = data);
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.mainForm.value.id?
      this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,true):
      this.formBuilderService.setControlsState(this.mainForm,this.immutableControllers,false);
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Conductor' : 'Create Conductor',
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
      ? this.conductorFacadeService.updateConductor(formData)
      : this.conductorFacadeService.createConductor(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dialogService.showSuccess('Conductor saved successfully.');
      },
      error: (err) =>{
        this.dialogService.showMessage({heading:'Failed to save Conductor.', message:err.errorMessage})
      },
      complete:()=>{
        this.loadTable();
        this.createMainForm();
        this.formBuilderService.resetForm(this.mainForm);
        this.formBuilderService.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private edit(row: Conductor): void {
    this.employees = this.conductors.map(conductor => conductor.employee);
    this.createMainForm();
    const  mappedRow = ConductorMapper.toForm(row);
    this.mainForm.patchValue(mappedRow);
    this.openMainForm();
  }

  // ===== Export Operations =====
  private toPdf():void {
    if (this.selectedRows.size > 0) {
      this.dialogService.showPrintDialog({
        width:'1500px',
        height:'650px',
        title: 'Conductor Details',
        mode: 'table',
        data: Array.from(this.selectedRows),
        columns: this.exportMeta
      }).subscribe((result) => {
        if (result) {
          this.selectedRows = new Set<Conductor>();
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
      'selected-conductors.xlsx'
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
    if (checked) this.conductors.forEach(row => this.selectedRows.add(row));
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((filters: Record<string, any>) => {
        this.conductorFacadeService.searchConductor(filters)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => (this.conductors = data));
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
