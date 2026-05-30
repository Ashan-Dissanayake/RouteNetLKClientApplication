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
import {ConductorFacadeService} from './conductorfacade.service';
import {ConductorMetadata} from '../../model/conductor.metadata.model';
import {CONDUCTOR_FILTER_FORM_META, CONDUCTOR_MAIN_FORM_META} from '../../model/conductor.meta';
import {Conductor} from '../../entity/conductor';
import {ConductorMapper} from '../../../../shared/mappers/ConductorMapper';

@Injectable()
export class ConductorFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
    private facade:      ConductorFacadeService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====

  buildFilterForm(metadata: ConductorMetadata): FormGroup {
    return this.formBuilder.build([...CONDUCTOR_FILTER_FORM_META], {
      sscrewstatus:         metadata.crewStatuses,
      ssroutefamilitylevel: metadata.routeFamiliarityLevels,
    });
  }

  // ===== Main form — create mode =====

  buildMainForm(metadata: ConductorMetadata): FormGroup {
    return this.formBuilder.build([...CONDUCTOR_MAIN_FORM_META], {
      employee:              metadata.employees,
      crewstatus:            metadata.crewStatuses,
      routefamiliaritylevel: metadata.routeFamiliarityLevels,
      regexes:               metadata.regexes,
    });
  }

  // ===== Main form — edit mode =====
  //
  // Edit mode uses only employees who are already assigned as conductors,
  // derived from the current conductors snapshot — no extra API call needed.
  // The form is pre-patched with ConductorMapper.toForm(row).

  buildMainFormForEdit(metadata: ConductorMetadata, row: Conductor): FormGroup {
    const conductorEmployees: Employee[] = this.facade
      .getConductorsSnapshot()
      .map(c => c.employee);

    const form = this.formBuilder.build([...CONDUCTOR_MAIN_FORM_META], {
      employee:              conductorEmployees,
      crewstatus:            metadata.crewStatuses,
      routefamiliaritylevel: metadata.routeFamiliarityLevels,
      regexes:               metadata.regexes,
    });

    form.patchValue(ConductorMapper.toForm(row));
    return form;
  }
}
