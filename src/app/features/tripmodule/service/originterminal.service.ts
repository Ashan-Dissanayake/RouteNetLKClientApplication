import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {TripType} from '../entity/triptype';
import {OriginTerminal} from '../entity/originterminal';

@Injectable({ providedIn: 'root' })
export class OriginTerminalService extends BaseHttpService <OriginTerminal>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<OriginTerminal>>{
    return  this.getAll(ApiEndpoints.ORIGIN_TERMINAL);
  }

}
