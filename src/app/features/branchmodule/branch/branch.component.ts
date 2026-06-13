import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {BranchFacadeService} from '../services/util/branchfacade.service';
import {
  async,
  debounceTime,
  Observable,
  Subject,
  take,
  takeUntil
} from 'rxjs';
import {Branch} from '../entity/branch';
import {ButtonClickEvent, ButtonPanelComponent } from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {DialogService} from '../../../core/dialog.service';
import {MatButton} from '@angular/material/button';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {MatDivider} from '@angular/material/divider';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  BRANCH_DATA_EXPORT_META,
  BRANCH_FILTER_FORM_META,
  BRANCH_MAIN_FORM_META,
  BRANCH_TABLE_META
} from '../model/branch.meta';
import {BranchMetadata} from '../model/branch.metadata.model';
import {BranchFormService} from '../services/util/branchform.service';
import {BranchMetadataService} from '../services/util/branch.metadata.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonPanelComponent,
    NgForOf,
    DynamicFieldComponent,
    NgIf,
    DataTableComponent,
    TableCellDirective,
    MatButton,
    SideViewComponent,
    MatDivider,
    DatePipe,
    NgClass,
    MatIcon,
    FormsModule,
    AsyncPipe,
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatCardTitle,
  ],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
  providers: [
    BranchFacadeService,
    BranchFormService,
    BranchMetadataService,
  ],
})
export class BranchComponent implements OnInit, OnDestroy {

  // ===== Static config =====
  protected readonly tableColumns    = BRANCH_TABLE_META;
  protected readonly filterFormMeta  = BRANCH_FILTER_FORM_META;
  protected readonly mainFormMeta    = BRANCH_MAIN_FORM_META;
  protected readonly exportMeta      = BRANCH_DATA_EXPORT_META;
  protected readonly actionPanelConfig = buildActionPanel();

  // ===== Streams (pass-through from facade) =====
  protected readonly branches$: Observable<Branch[]>;
  protected readonly metadata$:  Observable<BranchMetadata>;
  protected readonly loading$:   Observable<boolean>;
  protected readonly error$:     Observable<any>;

  // ===== UI state =====
  protected activeRow:     Branch | null = null;
  protected selectedRows   = new Set<Branch>();
  protected selectedCount  = 0;
  protected readonly async = async;

  // ===== Forms =====
  protected filterForm: FormGroup = new FormGroup({});
  protected mainForm:   FormGroup = new FormGroup({});

  private destroy$ = new Subject<void>();

  constructor(
    private facade:      BranchFacadeService,
    private formService: BranchFormService,
    private formBuilder: FormbuilderService,
    private dialog:      DialogService,
  ) {
    this.branches$ = this.facade.branches$;
    this.metadata$  = this.facade.metadata$;
    this.loading$   = this.facade.loading$;
    this.error$     = this.facade.error$;
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialog.showErrorMessage('Failed to initialize module.', err),
      });

    this.facade.metadata$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(meta => {
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

  protected onRowClick(row: Branch): void {
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
      this.branches$.pipe(take(1)).subscribe(
        rows => rows.forEach(r => this.selectedRows.add(r)),
      );
    }
    this.selectedCount = this.selectedRows.size;
  }

  // ===== Row actions =====

  protected onRowAction(action: string, row: Branch): void {
    const actions: Record<string, () => void> = {
      'edit': () => this.openEditForm(row),
    };
    if (actions[action]) actions[action]();
    else this.dialog.showWarning(`Unknown row action: ${action}`);
  }

  // ===== Action panel =====

  protected onActionTriggered(event: ButtonClickEvent): void {
    const handlers: Record<string, () => void> = {
      'create':          () => this.openCreateForm(),
      'bulk-deactivate': () => this.deactivateSelected(),
      'clear-search':    () => this.formBuilder.resetForm(this.filterForm),
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

  // ===== Create =====

  private openCreateForm(): void {
    this.dialog.showFormPopup({
      heading: 'Create Branch',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.save(formData);
      else this.formBuilder.resetForm(this.mainForm);
    });
  }

  private save(formData: any): void {
    this.facade.create(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Branch created successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to create', err),

      complete: () => {
        this.facade.reload();
        this.formBuilder.resetForm(this.mainForm);
      },
    });
  }

  // ===== Edit =====
  private openEditForm(row: Branch): void {
    // Patch the existing form with the row's values then open the same popup
    this.mainForm.patchValue(row);

    this.dialog.showFormPopup({
      heading: 'Edit Branch',
      form:    this.mainForm,
      meta:    this.mainFormMeta,
      width:   '900px',
    }).subscribe(formData => {
      if (formData) this.update(formData);
      else this.formBuilder.resetForm(this.mainForm);
    });
  }

  private update(formData: any): void {
    this.facade.update(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next:     () => this.dialog.showSuccess('Branch updated successfully.'),
      error: (err) => this.dialog.showErrorMessage('Failed to update', err),
      complete: () => {
        this.facade.reload();
        this.formBuilder.resetForm(this.mainForm);
      },
    });
  }

  // ===== Bulk deactivate =====
  private deactivateSelected(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning(
        'Please select at least one branch.'
      );
      return;
    }

    this.dialog.showConfirmation({
      heading: 'Deactivate Branches',
      message: 'Are you sure you want to deactivate selected branches?',
    }).subscribe(confirmed => {
      if (!confirmed) return;

      const ids = Array.from(this.selectedRows);

      this.facade.deactivate(ids)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: res => {
            this.dialog.showSuccess(
              "Branches deactivated successfully."
            );

            this.selectedRows.clear();
            this.selectedCount = 0;

            this.facade.reload();
          },
          error: err => this.dialog.showErrorMessage('Deactivation failed', err)

        });
    });
  }

  // ===== Export =====
  protected toPdf(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to print.');
      return;
    }

    this.dialog.showPrintDialog({
      width:   '1500px',
      height:  '650px',
      title:   'Branch Details',
      mode:    'table',
      data:    Array.from(this.selectedRows),
      columns: this.exportMeta,
    }).subscribe(result => {
      if (result) {
        this.selectedRows.clear();
        this.selectedCount = 0;
      }
    });
  }

  protected toExcel(): void {
    if (this.selectedRows.size === 0) {
      this.dialog.showWarning('Please select at least one record to export.');
      return;
    }
    exportToExcel(Array.from(this.selectedRows), this.exportMeta, 'branch.xlsx');
  }

  // ===== Template helper =====
  protected trackByField(_: number, field: any): any {
    return field.key ?? _;
  }

}

