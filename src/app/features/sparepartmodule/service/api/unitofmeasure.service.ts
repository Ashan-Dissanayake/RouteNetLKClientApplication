import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {UnitOfMeasure} from '../../entity/unitofmeasure';

@Injectable({ providedIn: 'root' })
export class UnitOfMeasureService extends BaseHttpService <UnitOfMeasure>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<UnitOfMeasure>>{
    return  this.getAll(ApiEndpoints.UNIT_OF_MEASURE);
  }

}
