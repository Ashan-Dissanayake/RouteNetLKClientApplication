import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {Incident} from '../../entity/incident';
import {IncidentService} from '../api/incident.service';
import {EMPTY_INCIDENT_METADATA, IncidentMetadata} from '../../model/incidentreport.metadata.model';
import {IncidentMetadataService} from './incident.metadata.service';

@Injectable()
export class IncidentFacadeService implements OnDestroy {

  // ===== State =====
  private incidentSubject = new BehaviorSubject<Incident[]>([]);
  private metadataSubject = new BehaviorSubject<IncidentMetadata>(EMPTY_INCIDENT_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly incidents$ = this.incidentSubject.asObservable();
  readonly metadata$  = this.metadataSubject.asObservable();
  readonly loading$   = this.loadingSubject.asObservable();
  readonly error$     = this.errorSubject.asObservable();

  constructor(
    private incidentService: IncidentService,
    private metadataService: IncidentMetadataService,
  ) {}

  // ===== Lifecycle =====

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====

  initialize(): Observable<IncidentMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchIncidents()),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    );
  }

  // ===== Data loading =====

  reload(): void {
    this.fetchIncidents();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchIncidents(params);
  }

  // ===== CRUD =====
  create(data: Incident): Observable<Incident> {
    return this.incidentService.save(data);
  }

  // ===== Status transitions =====

  inProgress(incident: Incident):        Observable<Incident> { return this.incidentService.inProgress(incident.id); }
  vehicleRecovery(incident: Incident):   Observable<Incident> { return this.incidentService.vehicleRecovery(incident.id); }
  pendingAllocation(incident: Incident): Observable<Incident> { return this.incidentService.pendingAllocation(incident.id); }
  resolved(incident: Incident):          Observable<Incident> { return this.incidentService.resolved(incident.id); }
  closed(incident: Incident):            Observable<Incident> { return this.incidentService.closed(incident.id); }

  // ===== Internal helpers =====

  private fetchIncidents(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.incidentService.get(params).pipe(
      map(res => res.data as Incident[]),
      tap(data => this.incidentSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private setLoading(value: boolean): void { this.loadingSubject.next(value); }
  private clearError(): void               { this.errorSubject.next(null); }
}
