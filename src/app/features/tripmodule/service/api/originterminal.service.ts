import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {OriginTerminal} from '../../entity/originterminal';

/**
 * Service for managing OriginTerminal entities.
 * Extends the BaseHttpService to provide HTTP operations.
 */
@Injectable({ providedIn: 'root' })
export class OriginTerminalService extends BaseHttpService<OriginTerminal> {

  /**
   * Constructor for OriginTerminalService.
   * @param http The HttpClient instance used for making HTTP requests.
   */
  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Fetches all OriginTerminal entities from the API.
   * @returns An Observable containing the API response with OriginTerminal data.
   */
  get(): Observable<ApiResponse<OriginTerminal>> {
    return this.getAll(ApiEndpoints.ORIGIN_TERMINAL);
  }

}
