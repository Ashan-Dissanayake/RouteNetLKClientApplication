import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {TripType} from '../../entity/triptype';

/**
 * Service for managing TripType entities.
 * Extends the BaseHttpService to provide HTTP operations.
 */
@Injectable({ providedIn: 'root' })
export class TripTypeService extends BaseHttpService<TripType> {

  /**
   * Constructor for TripTypeService.
   * @param http The HttpClient instance used for making HTTP requests.
   */
  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Fetches all TripType entities from the API.
   * @returns An Observable containing the API response with a list of TripType entities.
   */
  get(): Observable<ApiResponse<TripType>> {
    return this.getAll(ApiEndpoints.TRIP_TYPE);
  }

}
