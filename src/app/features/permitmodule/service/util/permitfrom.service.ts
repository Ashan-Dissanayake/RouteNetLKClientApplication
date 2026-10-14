import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {PermitMetadata} from '../../model/permit.metadata.model';
import {PERMIT_FILTER_FORM_META, PERMIT_MAIN_FORM_META} from '../../model/permit.meta';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {Permit} from '../../entity/permit';


@Injectable()
export class PermitFormService implements CrudFormService<Permit, PermitMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: PermitMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...PERMIT_FILTER_FORM_META],
      {
        sspermitstatus: metadata.permitStatuses,
        ssroute: metadata.routes,
      }
    );
  }

  buildMainForm(
    metadata: PermitMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...PERMIT_MAIN_FORM_META],
      {
        vehicle: metadata.vehicles,
        branch: metadata.branches,
        permitestatus: metadata.permitStatuses,
        servicetype: metadata.serviceTypes,
        route: metadata.routes,
        regexes: metadata.regexes,
      }
    );
  }

  buildMainFormForEdit(
    metadata: PermitMetadata,
    row: Permit
  ): FormGroup {

    const form = this.buildMainForm(metadata);
    form.patchValue(row);

    return form;
  }
}
