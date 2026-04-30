import {Injectable} from '@angular/core';
import {BranchService} from '../branchmodule/services/branch.service';
import {BehaviorSubject, finalize, forkJoin, Observable, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Roster} from './entity/roster';
import {Branch} from '../branchmodule/entity/branch';
import {RosterService} from './service/roster.service';
import {RosterMapper} from '../../shared/mappers/rosterMapper';
import {RosterSummary} from './entity/rostersummary';
import {RosterShiftService} from './service/rostershift.service';
import {RosterShift} from './entity/rostershift';
import {RosterShiftAssignment} from './entity/rostershiftassignment';
import {RosterShiftAssignmentService} from './service/rostershiftassignment.service';

@Injectable({
  providedIn: 'root',
})
export class RosterFacadeService{

  private rosterSubject = new BehaviorSubject<RosterSummary[]>([]);
  roster$ = this.rosterSubject.asObservable();

  private rosterShiftSubject = new BehaviorSubject<RosterShift[]>([]);
  rosterShift$ = this.rosterShiftSubject.asObservable();

  private rosterShiftAssignmentSubject = new BehaviorSubject<RosterShiftAssignment[]>([]);
  rosterShiftAssignment$ = this.rosterShiftAssignmentSubject.asObservable();

  private metadataSubject = new BehaviorSubject<any>('');
  metadata$ = this.metadataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<any>('');
  error$ = this.errorSubject.asObservable();

  constructor(
    private branchService:BranchService,
    private rosterService:RosterService,
    private rosterShiftService:RosterShiftService,
    private rosterShiftAssignmentService:RosterShiftAssignmentService
  ) {
  }

  private clearError(): void { this.errorSubject.next(null); }

  initializeRosterModule(): Observable<any>{
    this.loadingSubject.next(true);
    this.clearError();

    return forkJoin({
      branches:this.loadBranches(),
    }).pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.reloadRosters()),
      catchError(err => { this.errorSubject.next(err); return throwError(() => err); }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  reloadRosters(): void { this.refreshRosters(); }

  loadRosters():Observable<RosterSummary[]>{
    this.loadingSubject.next(true);
    this.clearError();
    return this.rosterService.getSummaries().pipe(
      map(res=>res.data as RosterSummary[]),
      tap(data=>this.rosterSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(()=>err)}
      )
    );
  }

  loadRosterShifts(rosterID: number): Observable<RosterShift[]> {
    this.loadingSubject.next(true);
    this.clearError();

    return this.rosterShiftService.get(rosterID).pipe(
      map(res => res.data as RosterShift[]), // Reach into the "data" array
      tap(data => this.rosterShiftSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  loadRosterShiftAssignments(rosterId: number): Observable<RosterShiftAssignment[]> {
    this.loadingSubject.next(true);
    this.clearError();

    return this.rosterShiftAssignmentService.get(rosterId).pipe(
      map(res => res.data as RosterShiftAssignment[]),
      tap(data => this.rosterShiftAssignmentSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  createRoster(rosterData: Roster): Observable<Roster> {
    return this.rosterService.save(RosterMapper.fromForm(rosterData));
  }

  assignedCrew(rosterId:number):Observable<RosterShiftAssignment>{
    return this.rosterShiftAssignmentService.assigned(rosterId)
  }

  approvedAss(id: number) :Observable<RosterShiftAssignment>{
    return this.rosterShiftAssignmentService.approved(id);
  }

  rejectAss(id: number) :Observable<RosterShiftAssignment>{
    return this.rosterShiftAssignmentService.cancelled(id);
  }


  // ===== Metadata Loading =====
  loadBranches(): Observable<Branch[]> {return this.branchService.getSummary().pipe(map(res => res.data));}


  private refreshRosters(): void {
    this.loadRosters()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe();
  }

}
