import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {IncidentMetadata} from '../../model/incidentreport.metadata.model';
import {INCIDENT_FILTER_FORM_META, INCIDENT_MAIN_FORM_META} from '../../model/incident.meta';

@Injectable()
export class IncidentFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(metadata: IncidentMetadata): FormGroup {
    return this.formBuilder.build([...INCIDENT_FILTER_FORM_META], {
      ssincidenttype:  metadata.incidentTypes,
      sstripexecution: metadata.tripExecutions,
    });
  }

  // ===== Main form =====
  buildMainForm(metadata: IncidentMetadata): FormGroup {
    return this.formBuilder.build([...INCIDENT_MAIN_FORM_META], {
      branch:         metadata.branches,
      tripexecution:  metadata.tripExecutions,
      incidenttype:   metadata.incidentTypes,
      incidentstatus: metadata.incidentStatuses,
      regionalarea:   metadata.regionalOffices,
    });
  }
}
