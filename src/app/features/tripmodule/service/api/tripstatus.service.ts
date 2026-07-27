import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {TripStatus} from '../../entity/tripstatus';

/**
 * Service to manage TripStatus entities.
 * Extends the BaseHttpService to provide HTTP operations.
 */
@Injectable({ providedIn: 'root' })
export class TripStatusService extends BaseHttpService<TripStatus> {

  /**
   * Constructor for TripStatusService.
   * @param http - The HttpClient instance used for HTTP requests.
   */
  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Fetches all TripStatus entities from the API.
   * @returns An Observable containing the API response with TripStatus data.
   */
  get(): Observable<ApiResponse<TripStatus>> {
    return this.getAll(ApiEndpoints.TRIP_STATUS);
  }

}
