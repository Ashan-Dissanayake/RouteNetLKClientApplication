import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import {DashboardOverview} from './dashboardoverview';
import {DashboardService} from './dashboard.service';


@Injectable({
  providedIn: 'root'
})
export class DashboardFacadeService {
  private readonly _metrics$ = new BehaviorSubject<DashboardOverview | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  // Expose clean read-only selector streams to the component
  readonly metrics$: Observable<DashboardOverview | null> = this._metrics$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();
  readonly error$: Observable<String | null> = this._error$.asObservable();

  constructor(private dashboardService: DashboardService) {}

  /**
   * Triggers data synchronization from backend endpoints.
   * Updates loading flags and pushes state variations downstream.
   */
  loadDashboardMetrics(): void {
    this._loading$.next(true);
    this._error$.next(null);

    this.dashboardService.getOverviewMetrics()
      .pipe(
        finalize(() => this._loading$.next(false))
      )
      .subscribe({
        next: (response) => {
          // Unwrap data from the standard response envelope template
          if (response && response.data) {
            this._metrics$.next(response.data);
          }
        },
        error: (err) => {
          console.error('Failed to update dashboard metrics', err);
          this._error$.next('Could not fetch real-time operational data. Please try refresh.');
        }
      });
  }

  /**
   * Resets active subject caches safely when cleaning component states.
   */
  clearState(): void {
    this._metrics$.next(null);
    this._error$.next(null);
  }
}
