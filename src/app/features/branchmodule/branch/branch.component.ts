import {Component, OnInit,} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {MatError, MatFormField, MatInput, MatInputModule, MatLabel} from '@angular/material/input';
import {Branch} from "../model/branch";
import {FormbuilderService} from '../../../shared/form/formbuilder.service';
import {MatSelect} from '@angular/material/select';
import {MatNativeDateModule, MatOption} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {FormField} from '../../../shared/form/formfieldata.model';
import {BranchFacadeService} from '../branchfacade.service';
import {forkJoin} from 'rxjs';
import {MatDualListboxComponent} from '../../../shared/component/dual-list-box/mat-dual-listbox.component';
import {getFormFields} from '../../../shared/form/formfield.factory';

@Component({
  selector: 'app-test',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgForOf,
    MatSelect,
    MatOption,
    MatDatepickerInput,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatDualListboxComponent
  ],
  templateUrl: './branch.component.html',
  standalone: true,
  styleUrl: './branch.component.scss'
})
export class BranchComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  branchFormMeta: FormField[] = [];
  allDataLoaded: boolean = false;


  constructor(
    private formBuilder: FormbuilderService,
    public branchFacade: BranchFacadeService
  ) {}

  ngOnInit() {
    this.branchFormMeta = getFormFields(Branch.prototype);


    forkJoin({
      branchtype: this.branchFacade.loadBranchTypes(),
      branchstatus: this.branchFacade.loadBranchStatuses(),
      districts:this.branchFacade.loadDistricts(),
      regexes: this.branchFacade.loadRegexes()
    }).subscribe({
      next: (dataMap) => {
        this.form = this.formBuilder.build(this.branchFormMeta, dataMap);
        this.allDataLoaded = true;
      },
      error: (err) => console.error('Failed to load form data', err)
    });
  }



}
