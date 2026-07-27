import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {TripLookUpDataModel} from '../../model/trip.lookupdata.model';
import {TRIP_FILTER_FORM_META, TRIP_MAIN_FORM_META} from '../../model/trip.meta';
import {Trip} from '../../entity/trip';

/**
 * Service for building and managing forms related to trips.
 * Provides methods to create filter forms, main forms (create mode),
 * and main forms (edit mode) using metadata and trip data.
 */
@Injectable()
export class TripFormService implements OnDestroy {

  /**
   * Subject used to manage the lifecycle of subscriptions and prevent memory leaks.
   */
  private destroy$ = new Subject<void>();

  /**
   * Constructor for the TripFormService.
   * @param formBuilder - Service used to build forms dynamically.
   */
  constructor(private formBuilder: FormbuilderService) {}

  /**
   * Lifecycle hook that is called when the service is destroyed.
   * Completes the `destroy$` subject to clean up subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Builds a filter form for trips using the provided metadata.
   * @param lookUpData - Metadata containing trip types and statuses.
   * @returns A `FormGroup` representing the filter form.
   */
  buildFilterForm(lookUpData: TripLookUpDataModel): FormGroup {
    return this.formBuilder.build([...TRIP_FILTER_FORM_META], {
      sstriptype:   lookUpData.tripTypes,
      sstripstatus: lookUpData.tripStatuses,
    });
  }

  /**
   * Builds the main form for creating a trip using the provided metadata.
   * @param lookUpData - Metadata containing branches, trip types, statuses, calendars, permits, and terminals.
   * @returns A `FormGroup` representing the main form in create mode.
   */
  buildMainForm(lookUpData: TripLookUpDataModel): FormGroup {
    return this.formBuilder.build([...TRIP_MAIN_FORM_META], {
      branch:          lookUpData.branches,
      triptype:        lookUpData.tripTypes,
      tripstatus:      lookUpData.tripStatuses,
      opcalender:      lookUpData.opCalenders,
      permite:         lookUpData.permits,
      originterminal:  lookUpData.originTerminals,
      shift:  lookUpData.shifts,
    });
  }

  /**
   * Builds the main form for editing a trip using the provided metadata and trip data.
   * @param lookUpData - Metadata containing branches, trip types, statuses, calendars, permits, and terminals.
   * @param row - The trip data to populate the form with.
   * @returns A `FormGroup` representing the main form in edit mode.
   */
  buildMainFormForEdit(lookUpData: TripLookUpDataModel, row: Trip): FormGroup {
    const form = this.buildMainForm(lookUpData);
    form.patchValue(row);
    return form;
  }
}

