import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {BranchService} from '../branchmodule/services/branch.service';
import {catchError, map} from 'rxjs/operators';
import {Branch} from '../branchmodule/entity/branch';
import {TripExecution} from './entity/tripexecution';
import {TripExecutionService} from './service/tripexecution.service';
import {TripExecutionStatusService} from './service/tripexecutionstatus.service';
import {TripExecutionStatus} from './entity/tripexecutionstatus';
import {PartRequest} from '../partrequestmodule/entity/partrequest';


@Injectable({
  providedIn: 'root',
})
export class TripExecutionFacadeService{

  private tripExecutionSubject = new BehaviorSubject<TripExecution[]>([]);
  tripExecutions$ = this.tripExecutionSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private branchService:BranchService,
    private tripExecutionStatusService:TripExecutionStatusService,
    private tripExecutionService:TripExecutionService
  ) {}

  private clearError(): void { this.errorSubject.next(null); }

  initializeTripExecutionModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();
    return forkJoin({
      branches:this.loadBranches(),
      tripExecutionStatuses:this.loadTripExecutionStatuses()
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.refreshTripExecutions()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadTripExecutions(): void { this.refreshTripExecutions(); }

  loadTripExecutions(params?:any):Observable<TripExecution[]>{
    this.loadingSubject.next(true);
    this.clearError();
    return this.tripExecutionService.get(params).pipe(
      map(res=>res.data as TripExecution[]),
      tap(data=>this.tripExecutionSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(()=>err)}
      )
    );
  }

  initializeTripExecution(data:any):Observable<TripExecution>{
    return this.tripExecutionService.initialize(data);
  }

  assignedResource(data: any) :Observable<TripExecution>{
    const payload = {
      branchId: data.branch.id,
      date: data.doservice
    };
    return this.tripExecutionService.assignedResource(payload);
  }

  checkedIn(id: number) :Observable<TripExecution>{
    return this.tripExecutionService.checkedIn(id);
  }

  dispatched(id: number) :Observable<TripExecution>{
    return this.tripExecutionService.dispatched(id);
  }

  inProgress(id: number) :Observable<TripExecution>{
    return this.tripExecutionService.inProgress(id);
  }

  arrived(id: number) :Observable<TripExecution>{
      return this.tripExecutionService.arrived(id);
  }
  breakdown(id: number) :Observable<TripExecution>{
      return this.tripExecutionService.breakdown(id);
  }

  completed(id: number) :Observable<TripExecution>{
    return this.tripExecutionService.completed(id);
  }

  cancelled(id: number) :Observable<TripExecution>{
    return this.tripExecutionService.cancelled(id);
  }


  // ===== Metadata Loading =====
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}
  loadTripExecutionStatuses(): Observable<TripExecutionStatus[]> {return this.tripExecutionStatusService.get().pipe(map(res => res.data));}

  // ===== Private Helpers =====
  private refreshTripExecutions(): void {
    this.loadTripExecutions()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
