import {Component, OnInit, TemplateRef} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormbuilderService } from '../../../shared/form/formbuilder.service';
import { BranchFacadeService } from '../branchfacade.service';
import { forkJoin } from 'rxjs';
import { Branch } from '../model/branch';
import { BranchStatus } from '../model/branchstatus';
import { BranchType } from '../model/branchtype';
import { District } from '../model/district';
import { Province } from '../model/province';
import {ButtonMeta, DashBoardMeta, FilterMeta, FormMeta} from '../branch.meta';
import {StatsGridComponent} from '../../../shared/component/stats-grid/stats-grid.component';
import {ButtonPanelComponent} from '../../../shared/component/button-panel/button-panel.component';
import {MatFormField} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatDualListboxComponent} from '../../../shared/component/dual-list-box/mat-dual-listbox.component';
import {DynamicFieldComponent} from '../../../shared/form/dynamic-field.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DialogService} from '../../../core/dialog.service';
import {MatButton} from '@angular/material/button';


@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [ReactiveFormsModule,
    StatsGridComponent,
    ButtonPanelComponent,
    NgForOf,
    DynamicFieldComponent, NgIf
  ],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit {

  stats = DashBoardMeta;
  buttons = ButtonMeta;
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

  popupDialogRef!: MatDialogRef<any>;


  allDataLoaded = false;
  showForm = false;

  constructor(
    private formBuilder: FormbuilderService,
    private branchFacade: BranchFacadeService,
    private dialogService:DialogService,
    private dialog:MatDialog
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
          ssbranchtype: this.branchTypes,
          ssbranchstatus: this.branchstatuses,
        });

        this.allDataLoaded = true;
      },
      error: (err) => console.error('Failed to load data', err)
    });

  }

  handleAction(actionType: string) {
    switch (actionType) {
      case 'create': {
            this.openFormPopup();
      } break;
      case 'export-csv': console.log('exportCsv() called'); break;
      case 'export-excel': console.log('exportExcel() called'); break;
      case 'bulk-deactivate': console.log('bulkDeactivate() called'); break;
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

}

