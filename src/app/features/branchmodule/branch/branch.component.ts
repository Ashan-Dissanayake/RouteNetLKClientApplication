import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormbuilderService } from '../../../shared/form/formbuilder.service';
import { BranchFacadeService } from '../branchfacade.service';
import {debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil} from 'rxjs';
import { Branch } from '../model/branch';
import { BranchStatus } from '../model/branchstatus';
import { BranchType } from '../model/branchtype';
import { District } from '../model/district';
import { Province } from '../model/province';
import {ActionPannelMeta, DashBoardMeta, FilterMeta, FormMeta, TableMeta} from '../branch.meta';
import {StatsGridComponent} from '../../../shared/component/stats-grid/stats-grid.component';
import {ButtonPanelComponent} from '../../../shared/component/button-panel/button-panel.component';
import {NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/form/dynamic-field.component';
import {DialogService} from '../../../core/dialog.service';
import {MatButton} from '@angular/material/button';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';


@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [ReactiveFormsModule,
    StatsGridComponent,
    ButtonPanelComponent,
    NgForOf,
    DynamicFieldComponent,
    NgIf,
    DataTableComponent,
    TableCellDirective,
    MatButton
  ],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit,OnDestroy {

  columns =TableMeta
  stats = DashBoardMeta;
  actionbuttons = ActionPannelMeta;
  mainFormMeta = FormMeta;
  filterFormMeta =FilterMeta;

  form: FormGroup = new FormGroup({});
  searchForm: FormGroup = new FormGroup({});

  branches!: Branch[];
  branchstatuses!: BranchStatus[];
  branchTypes!: BranchType[];
  districts!: District[];
  provinces!: Province[];
  regexes!: any;

  allDataLoaded = false;

  private destroy$ = new Subject<void>();


  constructor(
    private formBuilder: FormbuilderService,
    private branchFacade: BranchFacadeService,
    private dialogService:DialogService,
  ) {}

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    forkJoin({
      branches: this.branchFacade.loadBranches(),
      branchstatuses: this.branchFacade.loadBranchStatuses(),
      branchTypes: this.branchFacade.loadBranchTypes(),
      districts: this.branchFacade.loadDistricts(),
      provinces: this.branchFacade.loadProvinces(),
      regexes: this.branchFacade.loadRegexes()
    }).subscribe({
      next: (dataMap) => {
        this.branches = dataMap['branches'];
        this.branchstatuses = dataMap['branchstatuses'];
        this.branchTypes = dataMap['branchTypes'];
        this.districts = dataMap['districts'];
        this.provinces = dataMap['provinces'];
        this.regexes = dataMap['regexes'];

        // Build main form
        this.form = this.formBuilder.build(this.mainFormMeta, {
          branchtype: this.branchTypes,
          branchstatus: this.branchstatuses,
          districts: this.districts,
          regexes: this.regexes,
        });

        //Build Search Form
        this.searchForm = this.formBuilder.build(this.filterFormMeta,{
          ssbranchstatus: this.branchstatuses,
        });

        this.allDataLoaded = true;
        this.OnSearchFormChanges();
      },
      error: (err) => console.error('Failed to load data', err)
    });
  }


  OnSearchFormChanges(){
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.branchFacade.searchBranches(data).subscribe((branches) => {
          this.branches = branches;
        });
      });
  }

  onActionPannel(actionType: string) {
    switch (actionType) {
      case 'create': this.openFormPopup(); break;
      case 'export-csv': console.log('exportCsv() called'); break;
      case 'export-excel': console.log('exportExcel() called'); break;
      case 'bulk-deactivate': console.log('bulkDeactivate() called'); break;
      case 'clear-search':this.searchForm.reset();
    }
  }

  openFormPopup() {
    this.dialogService.showFormPopup({
      heading: 'Edit Details',
      form: this.form,
      meta: this.mainFormMeta,
    }).subscribe(result => {
      if (result) {
        console.log('Popup form submitted:', result);
      } else {
        console.log('Popup cancelled');
      }
    });
  }

  onRowClick(row: any) {
    console.log('row clicked', row);
  }

  onRowActionClick(action: string, row: any) {
    switch (action) {
      case 'edit':this.editUser(row); break;
      case 'delete': console.log(row); break;
      default:console.warn('Unknown action:', action);
    }
  }

  private editUser(row: any) {
    this.form.patchValue(row);
    this.openFormPopup();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}

