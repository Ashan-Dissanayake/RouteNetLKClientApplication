import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {FareCollection} from '../../entity/farecollection';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class FareCollectionService extends BaseHttpService<FareCollection> implements CrudApiService<FareCollection> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<FareCollection>> {

    return this.getAll<FareCollection>(
      ApiEndpoints.FARE_COLLECTION,
      params
    );
  }

  save(
    fareCollection: FareCollection
  ): Observable<FareCollection> {

    return this.post(
      ApiEndpoints.FARE_COLLECTION,
      fareCollection
    );
  }

  reconciled(
    id: number
  ): Observable<FareCollection> {

    return this.postActionById(
      ApiEndpoints.TRIP_EXECUTION,
      id,
      'reconciled'
    );
  }
}
