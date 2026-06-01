import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {TripMetadata} from '../../model/trip.metadata.model';
import {TRIP_FILTER_FORM_META, TRIP_MAIN_FORM_META} from '../../model/trip.meta';
import {Trip} from '../../entity/trip';

@Injectable()
export class TripFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====

  buildFilterForm(metadata: TripMetadata): FormGroup {
    return this.formBuilder.build([...TRIP_FILTER_FORM_META], {
      sstriptype:   metadata.tripTypes,
      sstripstatus: metadata.tripStatuses,
    });
  }

  // ===== Main form — create mode =====

  buildMainForm(metadata: TripMetadata): FormGroup {
    return this.formBuilder.build([...TRIP_MAIN_FORM_META], {
      branch:          metadata.branches,
      triptype:        metadata.tripTypes,
      tripstatus:      metadata.tripStatuses,
      opcalender:      metadata.opCalenders,
      permite:         metadata.permits,
      originterminal:  metadata.originTerminals,
    });
  }

  // ===== Main form — edit mode =====

  buildMainFormForEdit(metadata: TripMetadata, row: Trip): FormGroup {
    const form = this.buildMainForm(metadata);
    form.patchValue(row);
    return form;
  }
}
