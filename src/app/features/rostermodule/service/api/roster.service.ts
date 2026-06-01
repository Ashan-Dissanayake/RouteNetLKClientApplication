import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Roster} from '../../entity/roster';
import {RosterSummary} from '../../entity/rostersummary';


@Injectable({ providedIn: 'root' })
export class RosterService extends BaseHttpService <Roster>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Roster>>{
    return  this.getAll(ApiEndpoints.ROSTER,params);
  }


  getSummaries():Observable<ApiResponse<RosterSummary>>{
    return  this.getAll(ApiEndpoints.ROSTER_SUMMARIES);
  }

  save(roster:Roster):Observable<Roster>{
    return this.post(ApiEndpoints.ROSTER,roster);
  }

}
