import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Part} from '../../entity/part';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class PartService
  extends BaseHttpService<Part> implements CrudApiService<Part> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<Part>> {
    return this.getAll<Part>(
      ApiEndpoints.PART,
      params
    );
  }

  getSummary(): Observable<ApiResponse<Part>> {
    return this.getAll<Part>(
      ApiEndpoints.PART_SUMMARIES
    );
  }

  save(part: Part): Observable<Part> {
    return this.post(
      ApiEndpoints.PART,
      part
    );
  }

  update(part: Part): Observable<Part> {
    return this.put(
      ApiEndpoints.PART,
      part
    );
  }

  deactivate(
    ids: number[]
  ): Observable<number[]> {

    return this.http.post<number[]>(
      ApiEndpoints.PART_DEACTIVATE,
      ids
    );
  }
}
