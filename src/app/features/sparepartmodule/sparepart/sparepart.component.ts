import { Component, OnDestroy, OnInit } from '@angular/core';
import { PART_DATA_EXPORT_META, PART_FILTER_FORM_META, PART_IMMUTABLE_CONTROLLERS_META, PART_MAIN_FORM_META, PART_TABLE_META } from '../part.meta';
import { buildActionPanel } from '../../../shared/component/button/action-panel.factory';
import {async, Observable, Subject, take, takeUntil} from 'rxjs';
import { Part } from '../entity/part';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import { PartFacadeService } from '../partfacade.service';
import { DialogService } from '../../../core/dialog.service';
import { FormbuilderService } from '../../../core/formbuilder.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import { exportToExcel } from '../../../shared/component/export/excel-export.util';
import { ButtonClickEvent, ButtonPanelComponent } from '../../../shared/component/button/button-panel/button-panel.component';
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatCard, MatCardTitle, MatCardContent } from "@angular/material/card";
import { DynamicFieldComponent } from "../../../shared/component/form/dynamic-field.component";
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-sparepart',
  imports: [
    MatProgressBar,
    MatCard,
    MatCardTitle,
    MatCardContent,
    ButtonPanelComponent,
    DynamicFieldComponent,
    ReactiveFormsModule,
    NgIf,
    MatButton,
    AsyncPipe,
    NgForOf,
    DataTableComponent,
    MatDivider,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    NgClass,
  ],
  templateUrl: './sparepart.component.html',
  styleUrl: './sparepart.component.scss',
  standalone: true
})
export class SparepartComponent implements OnInit, OnDestroy {

  // ===== Meta Data =====
  protected readonly tableColumns = PART_TABLE_META;
  protected readonly actionPanelConfig = buildActionPanel();
  protected readonly filterFormMeta = PART_FILTER_FORM_META;
  protected readonly mainFormMeta = PART_MAIN_FORM_META;
  protected readonly immutableControllers = PART_IMMUTABLE_CONTROLLERS_META;
  protected readonly exportMeta = PART_DATA_EXPORT_META;

  // ===== Reactive State =====
  protected parts$: Observable<Part[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  // ===== UI State =====
  protected activePart: Part | null = null;
  protected selectedRows = new Set<Part>();

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm: FormGroup = new FormGroup({});

  constructor(
    private partFacade: PartFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.parts$ = this.partFacade.parts$;
    this.metadata$ = this.partFacade.metadata$;
    this.loading$ = this.partFacade.loading$;
    this.error$ = this.partFacade.error$;
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
    this.partFacade.initializePartModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize part module.', err)
      });
  }

  // ===== Form creation =====
  private createFilterForm(metadata: any): void {
    this.filterForm = this.formBuilderService.build(this.filterFormMeta, {
      sspartstatus: metadata.partStatuses,
      sscategory: metadata.partCategories
    });
    this.onFilterFormChanged();
  }

  private createMainForm(metadata: any): void {
    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      branch: metadata.branches,
      partstatus: metadata.partStatuses,
      partmaster: metadata.partMasters,
      regexes: metadata.regexes
    });
  }

  // ===== Filtering =====
  private onFilterFormChanged(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => this.partFacade.filterParts(filters));
  }

  // ===== Row & Selection Handlers =====
  protected onRowClick(row: Part): void {
    this.activePart = row;
  }


  protected reload(): void { this.partFacade.reloadParts(); }

  protected onCloseDetailView(): void {
    this.activePart = null;
  }

  protected onRowAction(action: string, row: Part) {
    if (action === 'edit') this.edit(row);
  }

  protected onRowCheckboxChanged(event: CheckboxEvent) {
    if (event.checked) this.selectedRows.add(event.row);
    else this.selectedRows.delete(event.row);
  }

  protected onSelectAll(checked: boolean) {
    this.selectedRows.clear();
    if (checked) {
      this.parts$.pipe(take(1)).subscribe(rows => rows.forEach(r => this.selectedRows.add(r)));
    }
  }

  // ===== CRUD =====
  private openMainForm(): void {
    this.mainForm.value.id
      ? this.formBuilderService.setControlsState(this.mainForm, this.immutableControllers, true)
      : this.formBuilderService.setControlsState(this.mainForm, this.immutableControllers, false);

    this.dialogService.showFormPopup({
      heading: this.mainForm.value.id ? 'Edit part' : 'Create part',
      form: this.mainForm,
      meta: this.mainFormMeta
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilderService.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    const operation$ = formData.id
      ? this.partFacade.updatePart(formData)
      : this.partFacade.createPart(formData);

    operation$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogService.showSuccess('part saved successfully.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to save part', message: err.errorMessage }),
      complete: () => {
        this.partFacade.reloadParts();
        this.formBuilderService.resetForm(this.mainForm);
        this.formBuilderService.setControlsState(this.mainForm, this.immutableControllers, false);
      }
    });
  }

  private edit(row: Part): void {
    const normalizedRow = this.formBuilderService.mapNestedValues(row, [
      { from: 'seatingcapacity.make', to: 'make', remove: false }
    ]);
    this.mainForm.patchValue(normalizedRow);
    this.openMainForm();
  }

  protected deactivateSelectedRows(): void {
    const toDeactivate = Array.from(this.selectedRows);
    this.dialogService.showConfirmation({ heading: 'Deactivation', message: 'Are you sure?' })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.partFacade.deactivateParts(toDeactivate)
          ?.pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () =>{
              this.dialogService.showSuccess('Selected parts deactivated.');
              this.partFacade.reloadParts();
            } ,
            error: (err) => this.dialogService.showError('Failed to deactivate parts.', err),
            complete: () => this.selectedRows.clear()
          });
      });
  }

  // ===== Export =====
  protected toPdf(): void {
    this.parts$.pipe(take(1)).subscribe(selectedArray => {
      if (this.selectedRows.size > 0) {
        this.dialogService.showPrintDialog({
          width: '1500px',
          height: '650px',
          title: 'Vehicle Details',
          mode: 'table',
          data: Array.from(this.selectedRows),
          columns: this.exportMeta
        }).subscribe(result => { if (result) this.selectedRows.clear(); });
      } else {
        this.dialogService.showWarning('Please select at least one record to print.');
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'sparts.xlsx');
  }

  // ===== Action Panel =====
  protected actionHandlers: Record<string, () => void> = {
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

  // ===== TrackBy for optimization =====
  trackByVehicleId(index: number, part: Part) {
    return part.id!;
  }

  trackByField(index: number, field: any) {
    return field.key || index;
  }


  protected readonly async = async;
}
