import {Injectable, OnDestroy} from '@angular/core';
import {VehicleService} from '../api/vehicle.service';
import {Vehicle} from '../../entity/vehicle';
import {EMPTY_VEHICLE_METADATA, VehicleMetadata} from '../../model/vehicle.metadata.model';
import {VehicleMetadataService} from './vehicle.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class VehicleFacadeService extends BaseFacade<Vehicle, VehicleMetadata> {

  constructor(
    private vehicleService: VehicleService,
    private vehicleMetadataService: VehicleMetadataService,
  ) {
    super(
      vehicleService,
      vehicleMetadataService,
      EMPTY_VEHICLE_METADATA
    );
  }

  readonly vehicles$ = this.items$;

  protected override validateCreate(data: Vehicle): string | null {

    const status = (data.vehiclestatus?.name ?? '').toLowerCase();
    const conditionRate = (data.conditionrate?.name ?? '').toLowerCase();

    const blockedRates = ['poor', 'critical'];

    if (status !== 'available' || blockedRates.includes(conditionRate)) {
      return 'Vehicle must be Available and not in Poor or Critical condition to be created.';
    }

    return null;
  }

  protected override getDeactivationIds(items: Vehicle[]): number[] {

    const allowedStatuses = [
      'decommissioned',
      'out of service'
    ];

    return items
      .filter(v =>
        allowedStatuses.includes(
          (v.vehiclestatus?.name ?? '').toLowerCase()
        )
      )
      .map(v => v.id!)
      .filter(id => id != null);
  }

  protected override getNoQualifyingDeactivateErrorMessage(): string {
    return 'Only vehicles with status Out of Service or Decommissioned can be deactivated.';
  }
}
