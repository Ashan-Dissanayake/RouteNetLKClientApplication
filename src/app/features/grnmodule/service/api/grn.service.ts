import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../applicationframework/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Grn} from '../../entity/grn';
import {CrudApiService} from '../../../../applicationframework/crudapi.service';

@Injectable({ providedIn: 'root' })
export class GrnService extends BaseHttpService<Grn> implements CrudApiService<Grn> {

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  get(
    params?: Record<string, unknown>
  ): Observable<ApiResponse<Grn>> {
    return this.getAll<Grn>(
      ApiEndpoints.GRN,
      params
    );
  }

  update(
    grn: Grn
  ): Observable<Grn> {
    return this.put(
      ApiEndpoints.GRN,
      grn
    );
  }
}
