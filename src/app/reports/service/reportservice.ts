import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Report1Response} from '../dispatchsummary/entity/report1response';
import {Report2Response} from '../revenuebypaymethods/entity/report2response';
import {map} from 'rxjs/operators';
import {Report3Response} from '../maintenancetrends/entity/report3response';
import {Report4Response} from '../fleetperformance/entity/report4response';
import {Report5Response} from '../incidentsummary/entity/report5response';

@Injectable({
  providedIn: 'root' // Makes the service available project-wide
})
export class ReportService {

  private  baseUrl = 'http://localhost:8080/analytics';

  constructor(private http: HttpClient) {}


  getReport1Metrics(): Observable<Report1Response> {
    return this.http.get<Report1Response>(`${this.baseUrl}/dispatch-summary`);
  }

  getReport2Metrics(): Observable<Report2Response> {
    return this.http.get<any>(`${this.baseUrl}/depot-revenue`).pipe(
      map(response => response.data || response)
    );
  }

  getReport3Metrics(): Observable<Report3Response> {
    return this.http.get<any>(`${this.baseUrl}/maintenance-trends`).pipe(
      map(response => response.data || response)
    );
  }

  getReport4Metrics(startDate: Date, endDate: Date): Observable<Report4Response> {
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    return this.http.get<any>(`${this.baseUrl}/fleet-performance`, {
      params: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      }
    }).pipe(map(res => res.data || res));
  }

  getReport5Metrics(): Observable<Report5Response> {
    return this.http.get<any>(`${this.baseUrl}/incident-distribution`).pipe(
      map(res => res.data || res)
    );
  }
}
