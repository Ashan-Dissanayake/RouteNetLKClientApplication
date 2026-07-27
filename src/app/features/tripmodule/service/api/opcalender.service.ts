import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {TripType} from '../../entity/triptype';
import {TripStatus} from '../../entity/tripstatus';
import {OpCalender} from '../../entity/opcalender';

/**
 * Service for managing operations related to the OpCalender entity.
 * Extends the BaseHttpService to provide HTTP operations.
 */
@Injectable({ providedIn: 'root' })
export class OpCalenderService extends BaseHttpService<OpCalender> {

  /**
   * Constructor for OpCalenderService.
   * @param http The HttpClient instance used for making HTTP requests.
   */
  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Fetches all OpCalender records from the API.
   * @returns An Observable containing the API response with a list of OpCalender entities.
   */
  get(): Observable<ApiResponse<OpCalender>> {
    return this.getAll(ApiEndpoints.OP_CALENDER);
  }

}
