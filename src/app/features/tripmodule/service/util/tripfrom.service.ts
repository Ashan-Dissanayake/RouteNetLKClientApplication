import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {TripLookUpDataModel} from '../../model/trip.lookupdata.model';
import {TRIP_FILTER_FORM_META, TRIP_MAIN_FORM_META} from '../../model/trip.meta';
import {Trip} from '../../entity/trip';
import {CrudFormService} from '../../../../applicationframework/crudform.service';

@Injectable()
export class TripFormService implements CrudFormService<Trip, TripLookUpDataModel> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: TripLookUpDataModel
  ): FormGroup {
    return this.formBuilder.build(
      [...TRIP_FILTER_FORM_META],
      {
        sstriptype: metadata.tripTypes,
        sstripstatus: metadata.tripStatuses,
      }
    );
  }

  buildMainForm(
    metadata: TripLookUpDataModel
  ): FormGroup {
    return this.formBuilder.build(
      [...TRIP_MAIN_FORM_META],
      {
        branch: metadata.branches,
        triptype: metadata.tripTypes,
        tripstatus: metadata.tripStatuses,
        opcalender: metadata.opCalenders,
        permite: metadata.permits,
        originterminal: metadata.originTerminals,
        shift: metadata.shifts,
      }
    );
  }

  buildMainFormForEdit(
    metadata: TripLookUpDataModel,
    row: Trip
  ): FormGroup {
    const form = this.buildMainForm(metadata);
    form.patchValue(row);
    return form;
  }
}
