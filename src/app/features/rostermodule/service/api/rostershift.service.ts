import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Injectable} from '@angular/core';
import {RosterShift} from '../../entity/rostershift';


@Injectable({ providedIn: 'root' })
export class RosterShiftService extends BaseHttpService <RosterShift>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // roster-shift.service.ts
  get(rosterID: number): Observable<ApiResponse<RosterShift>> {
    return this.getById<RosterShift>(ApiEndpoints.ROSTER_SHIFT, rosterID);
  }

}
