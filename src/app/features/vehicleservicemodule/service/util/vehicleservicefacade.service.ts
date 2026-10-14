import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../shared/util/search-criteria-normalizer';
import {VehicleService} from '../../entity/vehicleservice';
import {EMPTY_VEHICLE_SERVICE_METADATA, VehicleServiceMetadata} from '../../model/vehicleservice.metadata.model';
import {VehicleServiceService} from '../api/vehicleservice.service';
import {VehicleServiceMetadataService} from './vehicleservice.metadat.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class VehicleServiceFacadeService extends BaseFacade<VehicleService, VehicleServiceMetadata> {

  constructor(
    private vehicleServiceService: VehicleServiceService,
    private vehicleMetadataService: VehicleServiceMetadataService,
  ) {
    super(
      vehicleServiceService,
      vehicleMetadataService,
      EMPTY_VEHICLE_SERVICE_METADATA
    );
  }


  startExecution(id: number): Observable<VehicleService> {
    return this.vehicleServiceService.startExecution(id);
  }

  placeOnHold(id: number): Observable<VehicleService> {
    return this.vehicleServiceService.placeOnHold(id);
  }

  complete(id: number): Observable<VehicleService> {
    return this.vehicleServiceService.complete(id);
  }
}
