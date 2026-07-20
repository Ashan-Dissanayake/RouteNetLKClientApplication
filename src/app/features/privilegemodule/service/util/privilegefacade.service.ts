import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {Privilege} from '../../entity/privilege';
import {EMPTY_PRIVILEGE_LOOK_UP_DATA, PrivilegeLookUpData} from '../../model/privilege.lookupdata.model';
import {PrivilegeService} from '../api/privilege.service';
import {PrivilegeLookUpDataService} from './privilege.lookupdata.service';

@Injectable()
export class PrivilegeFacadeService implements OnDestroy {

  // ===== State =====
  private privilegeSubject = new BehaviorSubject<Privilege[]>([]);
  private lookUpDataSubject = new BehaviorSubject<PrivilegeLookUpData>(EMPTY_PRIVILEGE_LOOK_UP_DATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly privileges$ = this.privilegeSubject.asObservable();
  readonly lookUpData$  = this.lookUpDataSubject.asObservable();
  readonly loading$   = this.loadingSubject.asObservable();
  readonly error$     = this.errorSubject.asObservable();

  constructor(
    private privilegeService:  PrivilegeService,
    private lookUpDataService:  PrivilegeLookUpDataService,
  ) {}

  // ===== Lifecycle =====
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  initialize(): Observable<PrivilegeLookUpData> {
    this.setLoading(true);
    this.clearError();

    return this.lookUpDataService.loadAll().pipe(
      tap(lookUpData => this.lookUpDataSubject.next(lookUpData)),
      tap(() => this.fetchPrivileges()),
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
    this.fetchPrivileges();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchPrivileges(params);
  }


  assignPrivileges(roleId:number, privileges: Privilege[]): Observable<any> {
    const payload = {
      privileges: privileges.map(p => ({id:p.id}))
    };

    return this.privilegeService.assignPrivileges(roleId, payload)
      .pipe(catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
        takeUntil(this.destroy$)
      );
  }

  revokePrivileges(roleId:number, privileges:Privilege[]): Observable<any[]> {
    const requests = privileges.
    map(privilege => this.privilegeService.revokePrivilege(roleId, privilege.id));
    return forkJoin(requests)
      .pipe(
        catchError(err => {
          this.errorSubject.next(err);
          return throwError(() => err);
        }),
        takeUntil(this.destroy$)
      );
  }


  // ===== Internal helpers =====
  private fetchPrivileges(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.privilegeService.get(params).pipe(
      map(res => res.data as Privilege[]),
      tap(data => this.privilegeSubject.next(data)),
      catchError(err => {
        this.errorSubject.next(err);
        return throwError(() => err);
      }),
      finalize(() => this.setLoading(false)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private setLoading(value: boolean): void { this.loadingSubject.next(value); }
  private clearError(): void { this.errorSubject.next(null); }

}
