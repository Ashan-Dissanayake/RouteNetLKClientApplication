import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Trip} from '../../entity/trip';


/**
   * Service for managing Trip-related operations.
   * Extends the BaseHttpService to provide HTTP methods for Trip entities.
   */
  @Injectable({ providedIn: 'root' })
  export class TripService extends BaseHttpService<Trip> {

    /**
     * Constructor for TripService.
     * @param http The HttpClient instance used for making HTTP requests.
     */
    constructor(protected override http: HttpClient) {
      super(http);
    }

    /**
     * Fetches a list of trips with optional query parameters.
     * @param params Optional query parameters for filtering trips.
     * @returns An Observable containing the API response with a list of trips.
     */
    get(params?: any): Observable<ApiResponse<Trip>> {
      return this.getAll(ApiEndpoints.TRIP, params);
    }

    /**
     * Saves a new trip.
     * @param tripRequest The Trip object to be saved.
     * @returns An Observable containing the saved Trip object.
     */
    save(tripRequest: Trip): Observable<Trip> {
      return this.post(ApiEndpoints.TRIP, tripRequest);
    }

    /**
     * Updates an existing trip.
     * @param trip The Trip object with updated data.
     * @returns An Observable containing the updated Trip object.
     */
    update(trip: Trip): Observable<Trip> {
      return this.put(ApiEndpoints.TRIP, trip);
    }

    /**
     * Activates a trip by its ID.
     * @param id The ID of the trip to activate.
     * @returns An Observable containing the activated Trip object.
     */
    activateTrip(id: number): Observable<Trip> {
      return this.postActionById(ApiEndpoints.TRIP, id, 'activate-trip');
    }

    /**
     * Suspends a trip by its ID.
     * @param id The ID of the trip to suspend.
     * @returns An Observable containing the suspended Trip object.
     */
    suspendTrip(id: number): Observable<Trip> {
      return this.postActionById(ApiEndpoints.TRIP, id, 'suspend-trip');
    }

    /**
     * Discontinues a trip by its ID.
     * @param id The ID of the trip to discontinue.
     * @returns An Observable containing the discontinued Trip object.
     */
    discontinueTrip(id: number): Observable<Trip> {
      return this.postActionById(ApiEndpoints.TRIP, id, 'discontinue-trip');
    }
  }
