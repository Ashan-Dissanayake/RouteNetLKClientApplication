import {Injectable } from '@angular/core';
import {DriverService} from '../api/driver.service';
import {Driver} from '../../entity/driver';
import {DriverMapper} from './DriverMapper';
import {DriverMetadata, EMPTY_DRIVER_METADATA} from '../../model/driver.metadata.model';
import {DriverMetadataService} from './driver.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class DriverFacadeService extends BaseFacade<Driver, DriverMetadata> {

  constructor(
    private driverService: DriverService,
    metadataService: DriverMetadataService,
  ) {
    super(
      driverService,
      metadataService,
      EMPTY_DRIVER_METADATA,
    );
  }

  protected override validateCreate(
    data: Driver
  ): string | null {

    const status =
      data.crewstatus?.name?.toLowerCase();

    return status !== 'eligible'
      ? 'Driver must have an eligible status to be created.'
      : null;
  }

  protected override beforeCreate(
    data: Driver
  ): Driver {
    return DriverMapper.fromForm(data);
  }

  protected override beforeUpdate(
    data: Driver
  ): Driver {
    return DriverMapper.fromForm(data);
  }

  getDriversSnapshot(): Driver[] {
    return this.itemsSubject.getValue();
  }
}
