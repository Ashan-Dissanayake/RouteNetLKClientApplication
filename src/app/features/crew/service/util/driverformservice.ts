import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {DriverFacadeService} from './driverfacade.service';
import {DriverMetadata} from '../../model/driver.metadata.model';
import {FormGroup} from '@angular/forms';
import {DRIVER_FILTER_FORM_META, DRIVER_MAIN_FORM_META} from '../../model/driver.meta';
import {Driver} from '../../entity/driver';
import {Employee} from '../../../employeemodule/entity/employee';
import {DriverMapper} from './DriverMapper';
import {CrudFormService} from '../../../../applicationframework/crudform.service';

@Injectable()
export class DriverFormService implements CrudFormService<Driver, DriverMetadata> {

  constructor(
    private formBuilder: FormbuilderService,
    private facade: DriverFacadeService,
  ) {}

  buildFilterForm(
    metadata: DriverMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...DRIVER_FILTER_FORM_META],
      {
        sscrewstatus:
        metadata.crewStatuses,

        ssroutefamilitylevel:
        metadata.routeFamiliarityLevels,
      }
    );
  }

  buildMainForm(
    metadata: DriverMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...DRIVER_MAIN_FORM_META],
      {
        employee: metadata.employees,
        licensecategory:
        metadata.licenceCategories,
        crewstatus:
        metadata.crewStatuses,
        routefamiliaritylevel:
        metadata.routeFamiliarityLevels,
        regexes:
        metadata.regexes,
      }
    );
  }

  buildMainFormForEdit(
    metadata: DriverMetadata,
    row: Driver
  ): FormGroup {

    const driverEmployees: Employee[] =
      this.facade
        .getDriversSnapshot()
        .map(driver => driver.employee);

    const form = this.formBuilder.build(
      [...DRIVER_MAIN_FORM_META],
      {
        employee: driverEmployees,
        licensecategory:
        metadata.licenceCategories,
        crewstatus:
        metadata.crewStatuses,
        routefamiliaritylevel:
        metadata.routeFamiliarityLevels,
        regexes:
        metadata.regexes,
      }
    );

    form.patchValue(
      DriverMapper.toForm(row)
    );

    return form;
  }
}
