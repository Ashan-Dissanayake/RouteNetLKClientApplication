import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Trip} from '../../entity/trip';
import {EMPTY_TRIP_METADATA, TripLookUpDataModel} from '../../model/trip.lookupdata.model';
import {TripService} from '../api/trip.service';
import {TripLookupDataService} from './trip.lookupdata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class TripFacadeService extends BaseFacade<Trip, TripLookUpDataModel> {

  constructor(
    private tripService: TripService,
    metadataService: TripLookupDataService,
  ) {
    super(
      tripService,
      metadataService,
      EMPTY_TRIP_METADATA,
    );
  }

  // ==============================
  // Domain State Transitions
  // ==============================

  activate(trip: Trip): Observable<Trip> {
    return this.tripService.activateTrip(trip.id);
  }

  suspend(trip: Trip): Observable<Trip> {
    return this.tripService.suspendTrip(trip.id);
  }

  discontinue(trip: Trip): Observable<Trip> {
    return this.tripService.discontinueTrip(trip.id);
  }
}
