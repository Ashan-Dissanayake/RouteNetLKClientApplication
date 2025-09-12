import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from './api-endpoints';
import {BaseHttpService} from './basehttp.service';
import {ApiResponse} from '../shared/models/apiresponse.model';
import {Regex} from '../shared/models/regex.model';

@Injectable({ providedIn: 'root' })
export class RegexService extends BaseHttpService<any>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  getRegexes(type: string): Observable<ApiResponse<Regex,false>> {
    return this.getObject<Regex>(`${ApiEndpoints.regexes}/${type}`);
  }


}
