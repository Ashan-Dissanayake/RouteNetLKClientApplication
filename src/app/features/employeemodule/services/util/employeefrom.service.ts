import {Injectable, OnDestroy} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {EmployeeFacadeService} from './employeefacade.service';
import {EmployeeMetadata} from '../../model/employee.metadata.model';
import {FormGroup} from '@angular/forms';
import {EMPLOYEE_FILTER_FORM_META, EMPLOYEE_MAIN_FORM_META} from '../../model/employee.meta';
import {Gender} from '../../entity/gender';


@Injectable()
export class EmployeeFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
    private facade:      EmployeeFacadeService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(metadata: EmployeeMetadata): FormGroup {
    return this.formBuilder.build([...EMPLOYEE_FILTER_FORM_META], {
      ssdepartment: metadata.departments,
    });
  }

  // ===== Main form =====
  buildMainForm(metadata: EmployeeMetadata): FormGroup {
    const form = this.formBuilder.build([...EMPLOYEE_MAIN_FORM_META], {
      gender:metadata.genders,
      branch:metadata.branches,
      department:metadata.departments,
      designation:metadata.designations,
      employeetype:metadata.employeeTypes,
      employeestatus:metadata.employeeStatuses,
      regexes:metadata.regexes,
    });

    this.wireNicToGender(form, metadata.genders);
    return form;
  }

  // ===== NIC → gender auto-derive =====

  private wireNicToGender(form: FormGroup, genders: Gender[]): void {
    const nicControl = form.get('nic');
    if (!nicControl) return;

    nicControl.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(nic => {
      if (!nicControl.valid) return;

      const genderName = this.facade.extractGenderFromNIC(nic);
      if (!genderName) return;

      // Match the derived string to the actual Gender object in the options list
      // so the dropdown receives a full object, not just a string
      const matchedGender = genders.find(
        g => g.name.toLowerCase() === genderName.toLowerCase()
      );

      if (matchedGender) {
        // emitEvent: false prevents this setValue from re-triggering valueChanges
        form.get('gender')?.setValue(matchedGender, { emitEvent: false });
      }
    });
  }
}
