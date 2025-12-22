import {Component, OnDestroy, OnInit} from '@angular/core';
import {Driver} from '../model/driver';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatDivider} from '@angular/material/list';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ActionPanelMeta} from '../../../shared/models/actionpanel.meta';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AllowedBusType,} from '../model/allowedbustype';
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
import {DriverFilterMeta, DriverTableMeta} from '../driver.meta';


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
  protected  readonly tableColumns = DriverTableMeta;
  protected readonly driverFilterMeta = DriverFilterMeta;
  protected readonly actionPanelConfig = ActionPanelMeta;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});

  // --- Data ---
  protected drivers!: Driver[];
  protected allowedBusTypes!: AllowedBusType[];
  protected routeFamiliarityLevels!: RouteFamiliarityLevel[];
  protected crewStatuses!: CrewStatus[];

  private destroy$ = new Subject<void>();

  protected dataInitialized = false;

  private selectedRows = new Set<Driver>();
  protected activeDriver: Driver | null = null;


  constructor(
    private driverFacadeService:DriverFacadeService,
    private formBuilder: FormbuilderService,
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
      crewStatuses: this.driverFacadeService.loadCrewStatuses(),
      routeFamiliarityLevels: this.driverFacadeService.loadRouteFamiliarityLevels(),
    }).subscribe({
      next: data => this.handleMetadataLoad(data),
      error: (err) => this.dialogService.showError('Failed to load vehicle metadata.', err)
    });
    this.loadDriverTable();
  }

  private handleMetadataLoad(data: any): void {
    this.allowedBusTypes = data.allowedBusTypes;
    this.crewStatuses = data.crewStatuses;
    this.routeFamiliarityLevels = data.routeFamiliarityLevels;

    this.dataInitialized = true;

    this.initializeForms();
    this.subscribeToFilterChanges();
  }

  private initializeForms(): void {
    this.filterForm = this.formBuilder.build(this.driverFilterMeta, {
      sscrewstatus:this.crewStatuses,
      ssroutefamilitylevel:this.routeFamiliarityLevels,
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

  // ===== Table Selection =====
  protected onRowClick(row: any): void {
    this.activeDriver = row;
  }

  protected closeDetails(): void {
    this.activeDriver = null;
  }

  protected onRowAction(action: string, row: any) { }

  // Selection Handling
  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) this.drivers.forEach(row => this.selectedRows.add(row));
  }

  // ===== Action Panel =====
  private actionHandlers: Record<string, () => void> = {
    'clear-search': () => this.filterForm.reset()
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
