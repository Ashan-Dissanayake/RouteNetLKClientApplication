import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {VehicleMetadata} from '../../model/vehicle.metadata.model';
import {VEHICLE_FILTER_FORM_META, VEHICLE_MAIN_FORM_META} from '../../model/vehicle.meta';
import {Vehicle} from '../../entity/vehicle';

@Injectable()
export class VehicleFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(metadata: VehicleMetadata): FormGroup {
    return this.formBuilder.build([...VEHICLE_FILTER_FORM_META], {
      ssconditionrate: metadata.conditionRates,
      ssbustype:metadata.busTypes,
    });
  }

  // ===== Main form — create mode =====
  buildMainForm(metadata: VehicleMetadata): FormGroup {
    return this.formBuilder.build([...VEHICLE_MAIN_FORM_META], {
      vehiclestatus: metadata.vehicleStatuses,
      make:          metadata.makes,
      fueltype:      metadata.fuelTypes,
      bustype:       metadata.busTypes,
      conditionrate: metadata.conditionRates,
      model:         metadata.models,
      branch:        metadata.branches,
      regexes:       metadata.regexRules,
    });
  }

  // ===== Main form — edit mode =====
  //
  // The API returns vehicle data with a nested shape:
  // seating-capacity.make → needs to be flattened to make
  // before the form can be patched correctly.
  // mapNestedValues handles this normalization.

  buildMainFormForEdit(metadata: VehicleMetadata, row: Vehicle): FormGroup {
    const form = this.buildMainForm(metadata);
    const normalizedRow = this.formBuilder.mapNestedValues(row, [
      { from: 'seatingcapacity.make', to: 'make', remove: false },
    ]);
    form.patchValue(normalizedRow);
    return form;
  }
}
