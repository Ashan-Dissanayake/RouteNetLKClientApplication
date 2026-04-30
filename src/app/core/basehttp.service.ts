import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../shared/models/apiresponse.model';

export abstract class BaseHttpService<T> {
  constructor(protected http: HttpClient) { }

  // For endpoints that return arrays
  getAll<T>(url: string, params?: any): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key in params) {
        if (
          params.hasOwnProperty(key) &&
          params[key] !== '' && // skip empty strings
          params[key] !== null && // skip nulls
          params[key] !== undefined // skip undefined
        ) {
          httpParams = httpParams.set(key, params[key]);
        }
      }
    }

    return this.http.get<ApiResponse<T>>(url, { params: httpParams });
  }

  // For endpoints that return objects
  getObject<T>(url: string, params?: any): Observable<ApiResponse<T, false>> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          httpParams = httpParams.set(key, params[key]);
        }
      }
    }
    return this.http.get<ApiResponse<T, false>>(url, { params: httpParams });
  }

  // base.service.ts

  getById<T>(url: string, id: number | string): Observable<ApiResponse<T>> {
    const finalUrl = `${url}/${id}`;
    return this.http.get<ApiResponse<T>>(finalUrl);
  }

  post(url: string, data: T): Observable<T> {
    return this.http.post<T>(url, data);
  }


  put(url: string, data: T): Observable<T> {
    return this.http.put<T>(url, data);
  }

  postById(url: string, id: number, body?: any): Observable<T> {
    return this.http.post<T>(`${url}/${id}`, body ?? {});
  }

  putById(url: string, id: number): Observable<T> {
    return this.http.put<T>(`${url}/${id}`, {});
  }

  delete(url: string, id: number): Observable<T> {
    return this.http.delete<T>(`${url}/${id}`);
  }

  postActionById(
    url: string,
    id: number,
    action: string,
    body?: any
  ): Observable<T> {
    return this.http.post<T>(
      `${url}/${id}/${action}`,
      body ?? {}
    );
  }
}
