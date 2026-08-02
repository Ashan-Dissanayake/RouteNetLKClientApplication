import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Trip} from '../../entity/trip';
import {EMPTY_TRIP_METADATA, TripLookUpDataModel} from '../../model/trip.lookupdata.model';
import {TripService} from '../api/trip.service';
import {TripLookupDataService} from './trip.lookupdata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class TripFacadeService extends BaseFacade<Trip, TripLookUpDataModel> {

  readonly trips$ = this.items$;

  constructor(
    private tripService: TripService,
    private tripMetadataService: TripLookupDataService,
  ) {
    super(
      tripService,
      tripMetadataService,
      EMPTY_TRIP_METADATA
    );
  }


  // ===== Domain transitions =====
  activate(trip: Trip): Observable<Trip> {
    return this.tripService.activateTrip(trip.id);
  }


  suspend(trip: Trip): Observable<Trip> {
    return this.tripService.suspendTrip(trip.id);
  }


  discontinue(trip: Trip): Observable<Trip> {
    return this.tripService.discontinueTrip(trip.id);
  }


  // ===== Optional business rules =====
  protected override validateCreate(data: Trip): string | null {
    return null;
  }


  protected override beforeCreate(data: Trip): Trip {
    return data;
  }


  protected override beforeUpdate(data: Trip): Trip {
    return data;
  }

}
