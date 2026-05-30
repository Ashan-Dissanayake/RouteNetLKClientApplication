import {Injectable, OnDestroy} from '@angular/core';
import {filter, Subject, switchMap, takeUntil} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {DriverFacadeService} from './driverfacade.service';
import {DriverMetadata} from '../../model/driver.metadata.model';
import {FormGroup, Validators} from '@angular/forms';
import {DRIVER_FILTER_FORM_META, DRIVER_MAIN_FORM_META} from '../../model/driver.meta';
import {Driver} from '../../entity/driver';
import {Employee} from '../../../employeemodule/entity/employee';
import {DriverMapper} from '../../../../shared/mappers/DriverMapper';

@Injectable()
export class DriverFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
    private facade:      DriverFacadeService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(metadata: DriverMetadata): FormGroup {
    return this.formBuilder.build([...DRIVER_FILTER_FORM_META], {
      sscrewstatus:           metadata.crewStatuses,
      ssroutefamilitylevel:   metadata.routeFamiliarityLevels,
    });
  }

  // ===== Main form — create mode =====
  buildMainForm(metadata: DriverMetadata): FormGroup {
    const form = this.formBuilder.build([...DRIVER_MAIN_FORM_META], {
      employee:              metadata.employees,
      licensecategory:       metadata.licenceCategories,
      crewstatus:            metadata.crewStatuses,
      routefamiliaritylevel: metadata.routeFamiliarityLevels,
      regexes:               metadata.regexes,
    });

    this.wireLicenseCategoryToRegex(form);
    return form;
  }

  // ===== Main form — edit mode =====
  //
  // In edit mode the employee dropdown must show only employees
  // who are already assigned as drivers (derived from the current
  // drivers list), not the full employee list. The original code
  // did this by reassigning this.employees before rebuilding the form.
  // Here the form service handles it cleanly without touching the component.

  buildMainFormForEdit(metadata: DriverMetadata, row: Driver): FormGroup {
    // Derive the employee list from current drivers snapshot
    const driverEmployees: Employee[] = this.facade
      .getDriversSnapshot()
      .map(d => d.employee);

    const form = this.formBuilder.build([...DRIVER_MAIN_FORM_META], {
      employee:              driverEmployees,
      licensecategory:       metadata.licenceCategories,
      crewstatus:            metadata.crewStatuses,
      routefamiliaritylevel: metadata.routeFamiliarityLevels,
      regexes:               metadata.regexes,
    });

    // Map the row to form shape and patch
    form.patchValue(DriverMapper.toForm(row));

    this.wireLicenseCategoryToRegex(form);
    return form;
  }

  // ===== License category → dynamic regex wiring =====
  //
  // When the user selects a license category, the API is called to
  // get the regex rule for that category, and it is applied to the
  // license-number control dynamically.
  // Lives here not in the component — the component has zero awareness
  // that license category selection triggers an API call.

  private wireLicenseCategoryToRegex(form: FormGroup): void {
    form.get('licensecategory')?.valueChanges.pipe(
      filter(category => !!category?.name),
      switchMap(category => this.facade.loadDynamicRegexes(category.name)),
      takeUntil(this.destroy$),
    ).subscribe(regexData => {
      const licenseNumberControl = form.get('licensenumber');
      if (!licenseNumberControl) return;

      licenseNumberControl.setValidators([
        Validators.pattern(regexData['licensenumber'].regex),
      ]);
      // emitEvent: false prevents unnecessary valueChanges emissions
      // when validators are updated
      licenseNumberControl.updateValueAndValidity({ emitEvent: false });
    });
  }
}
