import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {User} from '../../entity/user';
import {UserService} from '../api/user.service';
import {UserLookUpDataService} from './user.lookupdata.service';
import {EMPTY_USER_LOOK_UP_DATA, UserLookUpData} from '../../model/user.lookupdata.model';
import {UserRoleService} from '../api/userrole.service';

@Injectable()
export class UserFacadeService implements OnDestroy {

  // ===== State =====
  private userSubject = new BehaviorSubject<User[]>([]);
  private lookUpDataSubject = new BehaviorSubject<UserLookUpData>(EMPTY_USER_LOOK_UP_DATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly users$ = this.userSubject.asObservable();
  readonly lookUpData$  = this.lookUpDataSubject.asObservable();
  readonly loading$   = this.loadingSubject.asObservable();
  readonly error$     = this.errorSubject.asObservable();

  constructor(
    private userService:  UserService,
    private userRoleService:UserRoleService,
    private lookUpDataService:  UserLookUpDataService,
  ) {}

  // ===== Lifecycle =====
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  initialize(): Observable<UserLookUpData> {
    this.setLoading(true);
    this.clearError();

    return this.lookUpDataService.loadAll().pipe(
      tap(lookUpData => this.lookUpDataSubject.next(lookUpData)),
      tap(() => this.fetchUsers()),
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
    this.fetchUsers();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchUsers(params);
  }

  // ===== CRUD =====
  create(data: User): Observable<User> {
    const {
      confirmPassword,
      ...payload
    } = data as any;

    return this.userService.save(data);
  }

  update(data: User): Observable<User> {

    const {
      password,
      // @ts-ignore
      confirmPassword,
      ...payload
    } = data;
    return this.userService.update(data);
  }

  changePassword(userId: number, data: any): Observable<any> {
    const {confirmPassword, ...payload} = data;
    return this.userService.changePassword(
      userId,
      payload
    );
  }

  resetPassword(userId:number, data:any):Observable<any>{
    const {confirmPassword, ...payload} = data;
    return this.userService.resetPassword(userId, payload);
  }

  replaceRoles(userId: number, data: any): Observable<any> {
    return this.userRoleService.replaceRoles(userId, data);
  }

  // ===== Internal helpers =====
  private fetchUsers(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.userService.get(params).pipe(
      map(res => res.data as User[]),
      tap(data => this.userSubject.next(data)),
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
