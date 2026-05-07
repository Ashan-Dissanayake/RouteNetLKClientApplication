import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatButton, MatIconButton} from '@angular/material/button';
import {TRIP_EXECUTION_MAIN_FORM_META, TRIP_EXECUTION_TABLE_META} from '../tripexecution.meta';
import {async, finalize, Observable, Subject, takeUntil} from 'rxjs';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../core/dialog.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {TripExecutionFacadeService} from '../tripexecutionfacade.service';
import {PART_REQUEST_MAIN_FORM_META, PART_REQUEST_TABLE_META} from '../../partrequestmodule/partrequest.meta';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {AsyncPipe, formatDate, LowerCasePipe, NgClass, NgForOf, NgIf, UpperCasePipe} from '@angular/common';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {TripExecution} from '../entity/tripexecution';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {MatChip} from '@angular/material/chips';
import {Trip} from '../../tripmodule/entity/trip';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-tripexecution',
  imports: [
    MatProgressBar,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    MatCardContent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    AsyncPipe,
    DataTableComponent,
    MatIcon,
    NgIf,
    TableCellDirective,
    MatTooltip,
    NgClass,
    MatMenuItem,
    MatMenu,
    MatIconButton,
    MatMenuTrigger,
    MatDivider,
    MatChip,
    UpperCasePipe,
    LowerCasePipe,
    MatProgressSpinner,
  ],
  templateUrl: './tripexecution.component.html',
  styleUrl: './tripexecution.component.scss',
  standalone:true
})
export class TripExecutionComponent implements OnInit, OnDestroy{
  // ===== Meta Data =====
  protected readonly mainFormMeta = TRIP_EXECUTION_MAIN_FORM_META;
  protected readonly tableColumns = TRIP_EXECUTION_TABLE_META;

  // ===== Reactive State =====
  protected tripExecutions$: Observable<TripExecution[]>;
  protected metadata$: Observable<any>;
  protected loading$: Observable<boolean>;
  protected error$: Observable<any>;
  private destroy$ = new Subject<void>();

  // ===== Forms =====
  protected mainForm: FormGroup = new FormGroup({});

  protected activeTripExecution: any | null = null;
  isAssigning = false;

  protected readonly async = async;



  constructor(
    private tripExecutionFacade: TripExecutionFacadeService,
    private dialogService: DialogService,
    private formBuilderService: FormbuilderService,

  ) {
    // Safe assignment – BehaviorSubject guarantees a value
    this.tripExecutions$ = this.tripExecutionFacade.tripExecutions$;
    this.metadata$ = this.tripExecutionFacade.metadata$;
    this.loading$ = this.tripExecutionFacade.loading$;
    this.error$ = this.tripExecutionFacade.error$;
  }

  ngOnInit(): void {
    this.initializeModule();
    this.metadata$.pipe(takeUntil(this.destroy$)).subscribe(metadata => {
      this.createMainForm(metadata);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeModule() {
    this.tripExecutionFacade.initializeTripExecutionModule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => this.dialogService.showError('Failed to initialize module.', err)
      });
  }

  protected reload(): void { this.tripExecutionFacade.reloadTripExecutions(); }

  // ===== Form creation =====
  private createMainForm(metadata: any): void {
    const lineField = PART_REQUEST_MAIN_FORM_META.find(f => f.name === 'partrequestitems');
    if (lineField?.innerTableConfig) {
      lineField.innerTableConfig.dataMap = { part: metadata.parts };
    }

    this.mainForm = this.formBuilderService.build(this.mainFormMeta, {
      branch: metadata.branches,
      partrequeststatus: metadata.partRequestStatuses,
      partrequestitems: metadata.parts,
    });
  }

  protected initialize() {
    this.formBuilderService.handleSave(this.mainForm, 'Trip Execution', (payload) => {
      payload.doservice = formatDate(payload.doservice, 'yyyy-MM-dd', 'en-US');
      this.tripExecutionFacade.initializeTripExecution(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Successfully Initialized.');
            this.formBuilderService.resetForm(this.mainForm);
            // this.reload();
          },
          error: (err) => this.dialogService.showWarning('Error', err.errorMessage)
        });
    });
  }

  protected cancel() :void{
    this.formBuilderService.resetForm(this.mainForm);
  }

  private assignedResource(row:TripExecution): void {
    this.isAssigning = true;
    this.tripExecutionFacade.assignedResource(row)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isAssigning = false)
      ).
    subscribe({
      next: () => this.dialogService.showSuccess('Assigned.'),
      error: (err) => this.dialogService.showMessage({ heading: 'Failed to assigned resource', message: err.errorMessage }),
      complete: () => {
        this.reload();
        if (this.activeTripExecution?.id === row.id) this.activeTripExecution = null;
      }
    });
  }

  protected onRowClick(row: any): void {
    this.activeTripExecution = row;
  }
  protected onRowAction(action: string, row: any) {
    console.log(row)
    if (action === 'assigned') this.assignedResource(row);
  }

  protected changeStatus(status: string) {
   console.log(status)
  }

  private statusActionHandlers: Record<string, () => void> = {
    'scheduled': () =>console.log("1"),
    'dispatched': () => console.log("1"),
    'active': () => console.log("1"),
    'completed': () => console.log("1"),
    'interrupted': () => console.log("1"),
    'cancelled': () => console.log("1"),
  };
}
