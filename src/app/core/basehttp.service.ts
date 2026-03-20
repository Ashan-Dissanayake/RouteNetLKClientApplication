import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../shared/models/apiresponse.model';

/**
 * Abstract base class for HTTP services.
 * Each concrete service should extend this class with a specific model type.
 * DO NOT add @Injectable decorator here - concrete services handle their own injection.
 */
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

  post(url: string, data: T): Observable<T> {
    return this.http.post<T>(url, data);
  }

  put(url: string, data: T): Observable<T> {
    return this.http.put<T>(url, data);
  }

  delete(url: string, id: number): Observable<T> {
    return this.http.delete<T>(`${url}/${id}`);
  }
}