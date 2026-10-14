import {Injectable, OnDestroy} from '@angular/core';
import {VehicleService} from '../api/vehicle.service';
import {Vehicle} from '../../entity/vehicle';
import {EMPTY_VEHICLE_METADATA, VehicleMetadata} from '../../model/vehicle.metadata.model';
import {VehicleMetadataService} from './vehicle.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class VehicleFacadeService extends BaseFacade<Vehicle, VehicleMetadata> {

  constructor(
    private vehicleService: VehicleService,
    metadataService: VehicleMetadataService,
  ) {
    super(
      vehicleService,
      metadataService,
      EMPTY_VEHICLE_METADATA
    );
  }

  protected override validateCreate(
    data: Vehicle
  ): string | null {

    const status =
      (data.vehiclestatus?.name ?? '').toLowerCase();

    const conditionRate =
      (data.conditionrate?.name ?? '').toLowerCase();

    const blockedRates = [
      'poor',
      'critical',
    ];

    if (
      status !== 'available' ||
      blockedRates.includes(conditionRate)
    ) {
      return 'Vehicle must be Available and not in Poor or Critical condition to be created.';
    }

    return null;
  }

  protected override getDeactivationIds(
    items: Vehicle[]
  ): number[] {

    const allowedStatuses = [
      'decommissioned',
      'out of service',
    ];

    return items
      .filter(vehicle =>
        allowedStatuses.includes(
          (vehicle.vehiclestatus?.name ?? '').toLowerCase()
        )
      )
      .map(vehicle => vehicle.id)
      .filter(
        (id): id is number => id != null
      );
  }

  protected override getNoQualifyingDeactivateErrorMessage(): string {
    return 'Only vehicles with status Out of Service or Decommissioned can be deactivated.';
  }
}
