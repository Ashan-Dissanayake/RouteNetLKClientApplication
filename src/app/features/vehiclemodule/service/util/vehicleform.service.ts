import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {VehicleMetadata} from '../../model/vehicle.metadata.model';
import {VEHICLE_FILTER_FORM_META, VEHICLE_MAIN_FORM_META} from '../../model/vehicle.meta';
import {Vehicle} from '../../entity/vehicle';
import {CrudFormService} from '../../../../applicationframework/crudform.service';

@Injectable()
export class VehicleFormService implements CrudFormService<Vehicle, VehicleMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: VehicleMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...VEHICLE_FILTER_FORM_META],
      {
        ssconditionrate: metadata.conditionRates,
        ssbustype: metadata.busTypes,
      }
    );
  }

  buildMainForm(
    metadata: VehicleMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...VEHICLE_MAIN_FORM_META],
      {
        vehiclestatus: metadata.vehicleStatuses,
        make: metadata.makes,
        fueltype: metadata.fuelTypes,
        bustype: metadata.busTypes,
        conditionrate: metadata.conditionRates,
        model: metadata.models,
        branch: metadata.branches,
        regexes: metadata.regexRules,
      }
    );
  }

  buildMainFormForEdit(
    metadata: VehicleMetadata,
    row: Vehicle
  ): FormGroup {

    const form = this.buildMainForm(metadata);

    const normalizedRow =
      this.formBuilder.mapNestedValues(
        row,
        [
          {
            from: 'seatingcapacity.make',
            to: 'make',
            remove: false,
          },
        ]
      );

    form.patchValue(normalizedRow);

    return form;
  }
}
