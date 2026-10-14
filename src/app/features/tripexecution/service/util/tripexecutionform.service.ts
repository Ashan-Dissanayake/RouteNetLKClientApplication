import { Injectable, OnDestroy } from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {TripExecutionMetadata} from '../../model/tripexecution.metadata.model';
import {FormGroup} from '@angular/forms';
import {TRIP_EXECUTION_MAIN_FORM_META} from '../../model/tripexecution.meta';
import {TripExecution} from '../../entity/tripexecution';
import {CrudFormService} from '../../../../applicationframework/crudform.service';


@Injectable()
export class TripExecutionFormService implements CrudFormService<TripExecution, TripExecutionMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: TripExecutionMetadata
  ): FormGroup {
    return this.formBuilder.build([], {});
  }

  buildMainForm(
    metadata: TripExecutionMetadata
  ): FormGroup {
    return this.formBuilder.build(
      [...TRIP_EXECUTION_MAIN_FORM_META],
      {
        branch: metadata.branches,
        tripexecutionstatus: metadata.tripExecutionStatuses,
      }
    );
  }
}
