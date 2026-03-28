import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {Vehiclestatus} from '../entity/vehiclestatus';

@Injectable({ providedIn: 'root' })
export class VehiclestatusService extends BaseHttpService <Vehiclestatus>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<Vehiclestatus>>{
    return  this.getAll(ApiEndpoints.vehiclestatus);
  }

}
