import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {IncidentMetadata} from '../../model/incidentreport.metadata.model';
import {INCIDENT_FILTER_FORM_META, INCIDENT_MAIN_FORM_META} from '../../model/incident.meta';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {Incident} from '../../entity/incident';

@Injectable()
export class IncidentFormService implements CrudFormService<Incident, IncidentMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: IncidentMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...INCIDENT_FILTER_FORM_META],
      {
        ssincidenttype: metadata.incidentTypes,
        sstripexecution: metadata.tripExecutions,
      }
    );
  }

  buildMainForm(
    metadata: IncidentMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...INCIDENT_MAIN_FORM_META],
      {
        branch: metadata.branches,
        tripexecution: metadata.tripExecutions,
        incidenttype: metadata.incidentTypes,
        incidentstatus: metadata.incidentStatuses,
        regionalarea: metadata.regionalOffices,
      }
    );
  }

  buildMainFormForEdit(
    metadata: IncidentMetadata,
    row: Incident
  ): FormGroup {

    const form = this.buildMainForm(metadata);

    form.patchValue(row);

    return form;
  }
}
