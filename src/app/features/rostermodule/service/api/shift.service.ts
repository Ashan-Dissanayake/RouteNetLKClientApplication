import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {TripType} from '../../../tripmodule/entity/triptype';
import {Shift} from '../../entity/shift';

@Injectable({ providedIn: 'root' })
export class ShiftService extends BaseHttpService <Shift>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Shift>>{
    return  this.getAll(ApiEndpoints.SHIFTS);
  }

}
