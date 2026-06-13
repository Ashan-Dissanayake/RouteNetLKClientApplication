import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {VehicleServiceMetadata} from '../../model/vehicleservice.metadata.model';
import {VEHICLE_SERVICE_FILTER_FORM_META, VEHICLE_SERVICE_MAIN_FORM_META} from '../../model/vehicleservice.meta';


@Injectable()
export class VehicleServiceFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====

  buildFilterForm(metadata: VehicleServiceMetadata): FormGroup {
    return this.formBuilder.build([...VEHICLE_SERVICE_FILTER_FORM_META], {
      ssvehicle:   metadata.vehicles,
    });
  }

  // ===== Main form =====
  //
  // The inner table field (vehicleserviceparts) requires its dataMap
  // to be populated before build() runs so DynamicFieldComponent
  // can render the inner table columns with the correct parts list.
  // This is a side effect on the meta object — we operate on a
  // spread copy to avoid mutating the shared constant.

  buildMainForm(metadata: VehicleServiceMetadata): FormGroup {
    const metaCopy = VEHICLE_SERVICE_MAIN_FORM_META.map(f => ({ ...f }));

    const lineField = metaCopy.find(f => f.name === 'vehicleserviceparts');
    if (lineField?.innerTableConfig) {
      lineField.innerTableConfig = {
        ...lineField.innerTableConfig,
        dataMap: { part: metadata.parts },
      };
    }

    return this.formBuilder.build(metaCopy, {
      branch:                metadata.branches,
      vehicle:               metadata.vehicles,
      incdent:               metadata.incidents,
      vehicleservicetype:    metadata.vehicleServiceTypes,
      vehicleservicepriority: metadata.vehicleServicePriorities,
      vehicleservicestatus:  metadata.vehicleServiceStatuses,
    });
  }
}
