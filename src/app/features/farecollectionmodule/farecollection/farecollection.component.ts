import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  FARE_COLLECTION_DATA_EXPORT_META, FARE_COLLECTION_FILTER_FORM_META,
  FARE_COLLECTION_MAIN_FORM_META,
  FARE_COLLECTION_TABLE_META
} from '../model/farecollection.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {FareCollection} from '../entity/farecollection';
import {FareCollectionMetadata} from '../model/farecollection.metadata.model';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FareCollectionFacadeService} from '../service/util/farecollectionfacade.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {FareCollectionFormService} from '../service/util/farecollectionform.service';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {FareCollectionMetadataService} from '../service/util/farecollection.metadata.service';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-farecollection',
  imports: [
    AsyncPipe,
    MatProgressBar,
    NgIf,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    DataTableComponent,
    MatDivider,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    SideViewComponent,
    TableCellDirective,
    MatMenuTrigger,
    MatIcon
  ],
  templateUrl: './farecollection.component.html',
  styleUrl: './farecollection.component.scss',
  standalone:true,
  providers: [
    FareCollectionFacadeService,
    FareCollectionFormService,
    FareCollectionMetadataService,
  ]
})
export class FareCollectionComponent implements OnInit,OnDestroy{

  // ===== Static config (template-bound, never changes) =====
  protected readonly tableColumns    = FARE_COLLECTION_TABLE_META;
  protected readonly filterFormMeta  = FARE_COLLECTION_FILTER_FORM_META;
  protected readonly mainFormMeta    = FARE_COLLECTION_MAIN_FORM_META;
  protected readonly exportMeta    = FARE_COLLECTION_DATA_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel();

  // ===== Streams (pass-through from facade) =====
  protected readonly fareCollections$: Observable<FareCollection[]>;
  protected readonly metadata$:    Observable<FareCollectionMetadata>;
  protected readonly loading$:     Observable<boolean>;
  protected readonly error$:       Observable<any>;

  // ===== UI state =====
  protected activeRow: FareCollection | null = null;
  protected selectedRows = new Set<FareCollection>();
  protected selectedCount = 0;

  // ===== Forms =====
  protected filterForm = new FormGroup({});
  protected mainForm   = new FormGroup({});

  private destroy$ = new Subject<void>();
  private currentMetadata: FareCollectionMetadata | null = null;

  constructor(
    private facade:FareCollectionFacadeService,
    private formService: FareCollectionFormService,
    private formBuilder: FormbuilderService,
    private dialog:DialogService,
  ) {
    this.fareCollections$ = this.facade.fareCollections$;
    this.metadata$ = this.facade.metadata$;
    this.loading$ = this.facade.loading$;
    this.error$ = this.facade.error$;
  }

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ error: err => this.dialog.showErrorMessage('Failed to initialize module.', err) });

    this.facade.metadata$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(meta => {
      this.currentMetadata = meta;
      this.filterForm = this.formService.buildFilterForm(meta);
      this.mainForm   = this.formService.buildMainForm(meta);
      this.watchFilterForm();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter =====
  private watchFilterForm(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
    ).subscribe(values => this.facade.filter(values));
  }

  // ===== Row interaction =====
  protected onRowClick(row: FareCollection): void {
    this.activeRow = row;
  }

  protected onCloseDetailView(): void {
    this.activeRow = null;
  }

  protected onRowCheckboxChanged(event: CheckboxEvent): void {
    event.checked ? this.selectedRows.add(event.row) : this.selectedRows.delete(event.row);
    this.selectedCount = this.selectedRows.size;
  }

  protected onSelectAll(checked: boolean): void {
    this.selectedRows.clear();
    if (checked) {
      this.fareCollections$.pipe(takeUntil(this.destroy$)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r))
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  // ===== Row actions =====
  protected onRowAction(action: string, row: FareCollection): void {
    const transitions: Record<string, [Observable<any>, string]> = {
      'reconciled':        [this.facade.reconciled(row),        'Fare Collection is Reconciled.']
    };

    const match = transitions[action];
    if (match) this.executeRowAction(match[0], match[1], row);
    else this.dialog.showWarning(`Unknown action: ${action}`);
  }

  private executeRowAction(
    operation$: Observable<any>,
    successMessage: string,
    row: FareCollection,
  ): void {
    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess(successMessage),
      error:    err => this.dialog.showErrorMessage('Failed to execute', err),
      complete: () => {
        this.facade.reload();
        if (this.activeRow?.id === row.id) this.activeRow = null;
      },
    });
  }

  // ===== Action panel =====
  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'clear-search': () => this.formBuilder.resetForm(this.filterForm),
      'create':       () => this.openCreateForm(),
    };

    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`No handler for: ${event.type}`);
  }

  protected onDropdownOnlyClick(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'export-pdf':   () => this.toPdf(),
      'export-excel': () => this.toExcel(),
    };

    if (handlers[event.type]) handlers[event.type]();
    else this.dialog.showWarning(`Unhandled dropdown: ${event.type}`);
  }

  protected reload(): void {
    this.facade.reload();
  }

  // ===== Form dialog =====
  private openCreateForm(): void {
    this.dialog.showFormPopup({
      heading: 'Create Fare Collection',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else {
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      }
    });
  }

  private save(formData: any): void {
    this.facade.create(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Fare Collection created successfully.'),
      error:    err => this.dialog.showErrorMessage('Failed to create', err),
      complete: () => {
        this.facade.reload();
        if (this.currentMetadata) {
          this.mainForm = this.formService.buildMainForm(this.currentMetadata);
        }
      },
    });
  }

  // ===== Export =====
  protected toPdf(): void {
    this.fareCollections$.pipe(take(1)).subscribe(selectedArray => {
      if (this.selectedRows.size > 0) {
        this.dialog.showPrintDialog({
          width: '1500px',
          height: '650px',
          title: 'Fare Collection Details',
          mode: 'table',
          data: Array.from(this.selectedRows),
          columns: this.exportMeta
        }).subscribe(result => { if (result) this.selectedRows.clear(); });
      } else {
        this.dialog.showWarning('Please select at least one record to print.');
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'far-collection.xlsx');
  }

  // ===== Template helper =====
  protected trackByField(_: number, field: any): any {
    return field.key ?? _;
  }


}
