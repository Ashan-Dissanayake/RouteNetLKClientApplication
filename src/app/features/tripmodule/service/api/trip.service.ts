import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Trip} from '../../entity/trip';
import {Part} from '../../../sparepartmodule/entity/part';


@Injectable({ providedIn: 'root' })
export class TripService extends BaseHttpService <Trip>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Trip>>{
    return  this.getAll(ApiEndpoints.TRIP,params);
  }

  save(tripRequest:Trip):Observable<Trip>{
    return this.post(ApiEndpoints.TRIP,tripRequest);
  }

  update(trip:Trip):Observable<Trip>{
    return this.put(ApiEndpoints.TRIP,trip);
  }


  activateTrip(id: number): Observable<Trip> {
    return this.postActionById(
      ApiEndpoints.TRIP,
      id,
      'activate-trip'
    );
  }

  suspendTrip(id: number): Observable<Trip> {
    return this.postActionById(
      ApiEndpoints.TRIP,
      id,
      'suspend-trip'
    );
  }

  discontinueTrip(id: number): Observable<Trip> {
    return this.postActionById(
      ApiEndpoints.TRIP,
      id,
      'discontinue-trip'
    );
  }


}
