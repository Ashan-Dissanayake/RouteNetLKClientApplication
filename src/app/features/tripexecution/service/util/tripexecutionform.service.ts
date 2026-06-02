import { Injectable, OnDestroy } from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {TripExecutionMetadata} from '../../model/tripexecution.metadata.model';
import {FormGroup} from '@angular/forms';
import {TRIP_EXECUTION_MAIN_FORM_META} from '../../model/tripexecution.meta';
import {TripExecution} from '../../entity/tripexecution';


@Injectable()
export class TripExecutionFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildMainForm(metadata: TripExecutionMetadata): FormGroup {
    return this.formBuilder.build([...TRIP_EXECUTION_MAIN_FORM_META], {
      branch:                metadata.branches,
      tripexecutionstatus:   metadata.tripExecutionStatuses,
    });
  }
}
