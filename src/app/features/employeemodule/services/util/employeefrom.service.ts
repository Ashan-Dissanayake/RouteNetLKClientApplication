import {DestroyRef, inject, Injectable} from '@angular/core';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {EmployeeFacadeService} from './employeefacade.service';
import {EmployeeMetadata} from '../../model/employee.metadata.model';
import {FormGroup} from '@angular/forms';
import {EMPLOYEE_FILTER_FORM_META, EMPLOYEE_MAIN_FORM_META} from '../../model/employee.meta';
import {Gender} from '../../entity/gender';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {Employee} from '../../entity/employee';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Injectable()
export class EmployeeFormService implements CrudFormService<Employee, EmployeeMetadata> {

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private formBuilder: FormbuilderService,
    private facade: EmployeeFacadeService,
  ) {}

  buildFilterForm(
    metadata: EmployeeMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...EMPLOYEE_FILTER_FORM_META],
      {
        ssdepartment: metadata.departments,
      }
    );
  }

  buildMainForm(
    metadata: EmployeeMetadata
  ): FormGroup {

    const form = this.formBuilder.build(
      [...EMPLOYEE_MAIN_FORM_META],
      {
        gender: metadata.genders,
        branch: metadata.branches,
        department: metadata.departments,
        designation: metadata.designations,
        employeetype: metadata.employeeTypes,
        employeestatus: metadata.employeeStatuses,
        regexes: metadata.regexes,
      }
    );

    this.wireNicToGender(
      form,
      metadata.genders
    );

    return form;
  }

  buildMainFormForEdit(
    metadata: EmployeeMetadata,
    row: Employee
  ): FormGroup {

    const form = this.buildMainForm(metadata);

    form.patchValue(row);

    return form;
  }

  private wireNicToGender(
    form: FormGroup,
    genders: Gender[]
  ): void {

    const nicControl = form.get('nic');

    if (!nicControl) {
      return;
    }

    nicControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(nic => {

        if (!nicControl.valid) {
          return;
        }

        const genderName =
          this.facade.extractGenderFromNIC(nic);

        if (!genderName) {
          return;
        }

        const matchedGender =
          genders.find(
            gender =>
              gender.name.toLowerCase() ===
              genderName.toLowerCase()
          );

        if (matchedGender) {
          form.get('gender')?.setValue(
            matchedGender,
            {
              emitEvent: false
            }
          );
        }
      });
  }
}
