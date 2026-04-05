import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  PERMIT_FILTER_FORM_META,
  PERMIT_MAIN_FORM_META,
  PERMIT_TABLE_META
} from '../permit.meta';
import {PermitFacadeService} from '../permitfacade.service';
import {Observable, Subject, take, takeUntil} from 'rxjs';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {Permit} from '../entity/permit';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {AsyncPipe, DatePipe, NgClass, NgFor, NgIf} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {MatDivider} from '@angular/material/divider';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';

@Component({
  selector: 'app-permit',
  imports: [
    DataTableComponent,
    MatCardTitle,
    NgIf,
    MatCardContent,
    MatCard,
    MatProgressBar,
    MatButton,
    AsyncPipe,
    TableCellDirective,
    MatIcon,
    SideViewComponent,
    ButtonPanelComponent,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    ReactiveFormsModule,
    NgFor
  ],
  templateUrl: './permit.component.html',
  styleUrl: './permit.component.scss',
  standalone:true,
})
export class PermitComponent implements OnInit, OnDestroy{

  // ===== Meta Data =====
  protected readonly tableColumns = PERMIT_TABLE_META;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly filterFormMeta = PERMIT_FILTER_FORM_META;
  protected readonly mainFormMeta = PERMIT_MAIN_FORM_META;

  // ===== Reactive State =====
  protected permits$: Observable<Permit[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  // ===== UI State =====
  protected activePermit: Permit | null = null;
  protected selectedRows = new Set<Permit>();

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  constructor(
    private permitFacade:PermitFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.permits$ = this.permitFacade.permits$;
    this.metadata$ = this.permitFacade.metadata$;
    this.loading$ = this.permitFacade.loading$;
    this.error$ = this.permitFacade.error$;
  }

  ngOnInit(): void {
    this.initializeModule();
    this.metadata$.pipe(takeUntil(this.destroy$)).subscribe(metadata => {
      console.log(metadata)
      this.createFilterForm(metadata);
      this.createMainForm(metadata);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeModule() {
    this.permitFacade.initializePermitModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize permit module.', err)
      });
  }

  // ===== Form creation =====
  private createFilterForm(metadata: any): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      sspermitstatus: metadata.permitStatuses,
      ssroute: metadata.routes
    });
    this.onFilterFormChanged();
  }

  private createMainForm(metadata: any): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      vehicle: metadata.vehicles,
      branch: metadata.branches,
      permitestatus: metadata.permitStatuses,
      servicetype: metadata.serviceTypes,
      route: metadata.routes,
      regexes: metadata.regexes
    });
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => this.permitFacade.filterPermits(filters));
  }

  protected reload(): void { this.permitFacade.reloadPermits(); }

  protected onCloseDetailView(): void {
    this.activePermit = null;
  }

  // ===== Row & Selection Handlers =====
  protected onRowClick(row: Permit): void {
    this.activePermit = row;
  }

  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) {
      this.permits$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r))
      );
    }
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit Permit' : 'Create Permit',
      form: this.mainForm,
      meta: this.mainFormMeta
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = this.permitFacade.createPermit(formData);
    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('Permit saved successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to save Permit', message: err.errorMessage }),
      complete: () => {
        this.permitFacade.reloadPermits();
        this.formBuilderService.resetForm(this.mainForm);
      }
    });
  }

  private transferPermit(row:Permit): void {
    this.dialogService.showConfirmation({
      heading:"Permit Transfer",
      message:"Are you sure to TRANSFERRED this Permit-"+row.number
    }).subscribe(confirmed=>{
      if (!confirmed) return;
      this.permitFacade.transferPermit(row.id)
        ?.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialogService.showSuccess('Transferred.'),
          error: (err) => this.dialogService.showError('Failed to transferred.', err),
          complete:()=>{
            this.reload();
          }
        });
    })
  }

  // ===== Action Panel =====
  protected actionHandlers: Record<string,  (row?: Permit) => void> = {
    'clear-search': () => this.filterForm.reset(),
    'create': () => this.openMainForm(),
    'export-pdf': () => console.log("topdf"),
    'export-excel': () => console.log("toexcel")
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

  protected onRowAction(action: string, row: any) {
    if (action === 'transfer') this.transferPermit(row);
  }

  // ===== TrackBy for optimization =====
  protected trackByField(index: number, field: any): string { return field.name; }

}
