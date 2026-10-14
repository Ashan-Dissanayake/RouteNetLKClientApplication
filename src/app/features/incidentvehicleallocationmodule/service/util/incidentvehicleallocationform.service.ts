import {Injectable} from '@angular/core';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {IncidentVehicleAllocationFacadeService} from './incidentvehicleallocationfacade.service';
import {IncidentVehicleAllocationMetadata} from '../../model/incidentvehicleallocation.metadata.model';
import {
  INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META,
  INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META
} from '../../model/incidentvehicleallocation.meta';
import {IncidentVehicleAllocation} from '../../entity/incidentvehicleallocation';
import {CrudFormService} from '../../../../applicationframework/crudform.service';

@Injectable()
export class IncidentVehicleAllocationFormService implements CrudFormService<IncidentVehicleAllocation, IncidentVehicleAllocationMetadata> {

  constructor(
    private formBuilder: FormbuilderService,
    private facade: IncidentVehicleAllocationFacadeService,
  ) {}

  buildFilterForm(
    metadata: IncidentVehicleAllocationMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META],
      {
        ssvehicle: metadata.vehicles,
      }
    );
  }

  buildMainForm(
    metadata: IncidentVehicleAllocationMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META],
      {
        incident: metadata.incidents,
        vehicle: metadata.vehicles,
        providedbranch: metadata.branches,
        incidentvehicleallocationstatus:
        metadata.incidentVehicleAllocationStatuses,
      }
    );
  }

  buildMainFormForEdit(
    metadata: IncidentVehicleAllocationMetadata,
    row: IncidentVehicleAllocation
  ): FormGroup {

    const form = this.buildMainForm(metadata);

    form.patchValue(row);

    return form;
  }
}
