import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseHttpService} from '../core/basehttp.service';
import {ApiResponse} from '../shared/models/apiresponse.model';
import {ApiEndpoints} from '../core/api-endpoints';
import {DashboardOverview} from './dashboardoverview';



@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseHttpService <DashboardOverview>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  getOverviewMetrics(): Observable<ApiResponse<DashboardOverview, false>> {
    return this.getObject<DashboardOverview>(ApiEndpoints.DASHBOARD);
  }

}
