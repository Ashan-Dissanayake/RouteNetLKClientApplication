import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {TripType} from '../../entity/triptype';

@Injectable({ providedIn: 'root' })
export class TripTypeService extends BaseHttpService <TripType>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<TripType>>{
    return  this.getAll(ApiEndpoints.TRIP_TYPE);
  }

}
