import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {TripType} from '../../entity/triptype';
import {TripStatus} from '../../entity/tripstatus';
import {OpCalender} from '../../entity/opcalender';

@Injectable({ providedIn: 'root' })
export class OpCalenderService extends BaseHttpService <OpCalender>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<OpCalender>>{
    return  this.getAll(ApiEndpoints.OP_CALENDER);
  }

}
