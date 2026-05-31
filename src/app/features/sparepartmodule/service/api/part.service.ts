import {Injectable} from '@angular/core';
import {BaseHttpService} from '../../../../core/basehttp.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../../shared/models/apiresponse.model';
import {ApiEndpoints} from '../../../../core/api-endpoints';
import {Part} from '../../entity/part';

@Injectable({ providedIn: 'root' })
export class PartService extends BaseHttpService <Part>{

  constructor(protected override http: HttpClient) {
    super(http);
  }

  get(params?:any):Observable<ApiResponse<Part>>{
    return  this.getAll(ApiEndpoints.PART,params);
  }

  getSummary():Observable<ApiResponse<Part>>{
    return  this.getAll(ApiEndpoints.PART_SUMMARIES);
  }

  save(part:Part):Observable<Part>{
    return this.post(ApiEndpoints.PART,part);
  }

  update(part:Part):Observable<Part>{
    return this.put(ApiEndpoints.PART,part);
  }

  deactivate(ids: number[] | number): Observable<number[]> {
    const payload = Array.isArray(ids) ? ids : [ids];
    return this.http.post<number[]>(ApiEndpoints.PART_DEACTIVATE,ids);
  }
}
