import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {FareCollection} from '../../entity/farecollection';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';

@Injectable({ providedIn: 'root' })
export class FareCollectionService extends BaseHttpService <FareCollection>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<FareCollection>>{
    return  this.getAll(ApiEndpoints.FARE_COLLECTION,params);
  }

  save(fareCollection:FareCollection):Observable<FareCollection>{
    return this.post(ApiEndpoints.FARE_COLLECTION,fareCollection);
  }

  reconciled(id: number): Observable<FareCollection> {
    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'reconciled'
    );
  }

}
