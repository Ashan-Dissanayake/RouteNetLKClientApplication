import {Injectable} from '@angular/core';
import {BranchService} from '../branchmodule/services/branch.service';
import {TripTypeService} from './service/triptype.service';
import {PermitService} from '../permitmodule/service/permit.service';
import {TripStatusService} from './service/tripstatus.service';
import {OriginTerminalService} from './service/originterminal.service';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {Trip} from './entity/trip';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {TripService} from './service/trip.service';
import {Branch} from '../branchmodule/entity/branch';
import {TripType} from './entity/triptype';
import {Permit} from '../permitmodule/entity/permit';
import {TripStatus} from './entity/tripstatus';
import {OriginTerminal} from './entity/originterminal';

@Injectable({
  providedIn: 'root',
})
export class TripFacadeService{

  private tripSubject = new BehaviorSubject<Trip[]>([]);
  trip$ = this.tripSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private branchService:BranchService,
    private tripTypeService:TripTypeService,
    private permitService:PermitService,
    private tripStatusService:TripStatusService,
    private originTerminalService:OriginTerminalService,
    private tripService:TripService
  ) {
  }

  private clearError(): void { this.errorSubject.next(null); }

  initializeTripModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      branches:this.loadBranches(),
      tripTypes:this.loadTripTypes(),
      permits:this.loadPermits(),
      tripStatuses:this.loadTripStatus(),
      originTerminals:this.loadOriginTerminals(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshTrips()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadTrips(): void { this.refreshTrips(); }

  loadTrips(params?:any):Observable<Trip[]>{
    this.loadingSubject.next(true);
    this.clearError();
    return this.tripService.get(params).pipe(
      map(res=>res.data as Trip[]),
      tap(data=>this.tripSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(()=>err)}
      )
    );
  }

  filterTrips(criteria: Record<string, any>): void {
    const normalized = normalizeSearchCriteria(criteria);
    this.loadTrips(normalized)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        error: err => this.errorSubject.next(err)
      });
  }

  createTrip(tripData: Trip): Observable<Trip> {
    return this.tripService.save(tripData);
  }

  updateTrip(tripData: Trip): Observable<Trip> {
    return this.tripService.update(tripData);
  }

  activateTrip(trip:Trip):Observable<Trip>{
    return this.tripService.activateTrip(trip.id);
  }

  suspendTrip(trip:Trip):Observable<Trip>{
    return this.tripService.suspendTrip(trip.id);
  }

  discontinueTrip(trip:Trip):Observable<Trip>{
    return this.tripService.discontinueTrip(trip.id);
  }

  // ===== Metadata Loading =====
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}
  loadTripTypes(): Observable<TripType[]> { return this.tripTypeService.get().pipe(map(res => res.data)); }
  loadPermits(): Observable<Permit[]> { return this.permitService.getSummary().pipe(map(res => res.data)); }
  loadTripStatus(): Observable<TripStatus[]> { return this.tripStatusService.get().pipe(map(res => res.data)); }
  loadOriginTerminals(): Observable<OriginTerminal[]> { return this.originTerminalService.get().pipe(map(res => res.data)); }

  private refreshTrips(): void {
    this.loadTrips()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }
}
