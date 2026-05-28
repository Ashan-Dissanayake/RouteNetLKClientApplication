import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../core/api-endpoints';
import {TicketMachine} from '../entity/ticketmachine';

@Injectable({ providedIn: 'root' })
export class TicketMachineService extends BaseHttpService <TicketMachine>{
  constructor(protected override http: HttpClient) {
    super(http);
  }

  get():Observable<ApiResponse<TicketMachine>>{
    return  this.getAll(ApiEndpoints.TICKET_MACHINES);
  }
}
