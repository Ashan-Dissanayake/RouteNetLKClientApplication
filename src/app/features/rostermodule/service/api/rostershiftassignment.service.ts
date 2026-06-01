import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Injectable} from '@angular/core';
import {RosterShiftAssignment} from '../../entity/rostershiftassignment';
import {PartRequest} from '../../../partrequestmodule/entity/partrequest';
import {RosterShift} from '../../entity/rostershift';


@Injectable({ providedIn: 'root' })
export class RosterShiftAssignmentService extends BaseHttpService <RosterShiftAssignment>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  assigned(id: number): Observable<RosterShiftAssignment> {
    return this.postActionById(
      ApiEndpoints.ROSTER_SHIFT_ASSIGNMENT,
      id,
      'generate'
    );
  }

  approved(id: number): Observable<RosterShiftAssignment> {
      return this.postActionById(
        ApiEndpoints.ROSTER_SHIFT_ASSIGNMENT,
        id,
        'approved'
      );
    }

  cancelled(id: number): Observable<RosterShiftAssignment> {
    return this.postActionById(
      ApiEndpoints.ROSTER_SHIFT_ASSIGNMENT,
      id,
      'cancelled'
    );
  }

  get(rosterID: number): Observable<ApiResponse<RosterShiftAssignment>> {
    return this.getById<RosterShiftAssignment>(ApiEndpoints.ROSTER_SHIFT_ASSIGNMENT_VIEW, rosterID);
  }

}
