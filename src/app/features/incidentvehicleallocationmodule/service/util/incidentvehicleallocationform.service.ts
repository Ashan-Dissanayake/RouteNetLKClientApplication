import {Injectable, OnDestroy} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {IncidentVehicleAllocationFacadeService} from './incidentvehicleallocationfacade.service';
import {IncidentVehicleAllocationMetadata} from '../../model/incidentvehicleallocation.metadata.model';
import {
  INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META,
  INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META
} from '../../model/incidentvehicleallocation.meta';
import {Branch} from '../../../branchmodule/entity/branch';
import {Vehicle} from '../../../vehiclemodule/entity/vehicle';

@Injectable()
export class IncidentVehicleAllocationFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
    private facade:      IncidentVehicleAllocationFacadeService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildFilterForm(metadata: IncidentVehicleAllocationMetadata): FormGroup {
   const form =  this.formBuilder.build([...INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META], {
      ssvehicle:  metadata.vehicles,
    });
    console.log(form.controls);
    return  form;
  }

  buildMainForm(metadata: IncidentVehicleAllocationMetadata): FormGroup {
    // this.wireCascades(form);
    return this.formBuilder.build([...INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META], {
      incident: metadata.incidents,
      vehicle: metadata.vehicles,
      providedbranch: metadata.branches,
      incidentvehicleallocationstatus: metadata.incidentVehicleAllocationStatuses,
    });
  }

  private wireCascades(form: FormGroup): void {
    this.wireIncidentToBranch(form);
    this.wireBranchToVehicle(form);
  }

  private wireIncidentToBranch(form: FormGroup): void {
    form.get('incident')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(incident => {
        const branches: Branch[] = incident
          ? this.facade.getBranchesForIncident(incident.id)
          : [];

        this.formBuilder.updateOptions(
          INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META, form, 'providedbranch', branches,
        );
        this.formBuilder.updateOptions(
          INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META, form, 'vehicle', [],
        );
      });
  }

  private wireBranchToVehicle(form: FormGroup): void {
    form.get('providedbranch')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(branch => {
        const vehicles: Vehicle[] = branch
          ? this.facade.getVehiclesForBranch(branch.id)
          : [];
        this.formBuilder.updateOptions(
          INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META, form, 'vehicle', vehicles,
        );
      });
  }
}
