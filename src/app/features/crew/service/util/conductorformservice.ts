import {Injectable} from '@angular/core';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {Employee} from '../../../employeemodule/entity/employee';
import {ConductorFacadeService} from './conductorfacade.service';
import {ConductorMetadata} from '../../model/conductor.metadata.model';
import {CONDUCTOR_FILTER_FORM_META, CONDUCTOR_MAIN_FORM_META} from '../../model/conductor.meta';
import {Conductor} from '../../entity/conductor';
import {ConductorMapper} from './ConductorMapper';
import {CrudFormService} from '../../../../applicationframework/crudform.service';

@Injectable()
export class ConductorFormService implements CrudFormService<Conductor, ConductorMetadata> {

  constructor(
    private formBuilder: FormbuilderService,
    private facade: ConductorFacadeService,
  ) {}

  buildFilterForm(
    metadata: ConductorMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...CONDUCTOR_FILTER_FORM_META],
      {
        sscrewstatus: metadata.crewStatuses,
        ssroutefamilitylevel:
        metadata.routeFamiliarityLevels,
      }
    );
  }

  buildMainForm(
    metadata: ConductorMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...CONDUCTOR_MAIN_FORM_META],
      {
        employee: metadata.employees,
        crewstatus: metadata.crewStatuses,
        routefamiliaritylevel:
        metadata.routeFamiliarityLevels,
        regexes: metadata.regexes,
      }
    );
  }

  buildMainFormForEdit(
    metadata: ConductorMetadata,
    row: Conductor
  ): FormGroup {

    const conductorEmployees: Employee[] =
      this.facade
        .getConductorsSnapshot()
        .map(c => c.employee);

    const form = this.formBuilder.build(
      [...CONDUCTOR_MAIN_FORM_META],
      {
        employee: conductorEmployees,
        crewstatus: metadata.crewStatuses,
        routefamiliaritylevel:
        metadata.routeFamiliarityLevels,
        regexes: metadata.regexes,
      }
    );

    form.patchValue(
      ConductorMapper.toForm(row)
    );

    return form;
  }
}
