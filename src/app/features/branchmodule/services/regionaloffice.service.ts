import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../../core/api-endpoints';
import { BaseHttpService } from '../../../core/basehttp.service';
import { ApiResponse } from '../../../shared/models/apiresponse.model';
import { RegionalOffice } from '../model/regionaloffice';



@Injectable({ providedIn: 'root' })
export class RegionalOfficeService extends BaseHttpService<RegionalOffice> {

  constructor(http: HttpClient) {
    super(http);
  }


  get(): Observable<ApiResponse<RegionalOffice>> {
    return this.getAll(ApiEndpoints.regionaloffice);
  }

}
