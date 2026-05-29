import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {EmployeeService} from '../api/employee.service';
import {Employee} from '../../entity/employee';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {EmployeeMetadata, EMPTY_EMPLOYEE_METADATA} from '../../model/employee.metadata.model';
import {EmployeeMetadataService} from './employee.metadata.service';

@Injectable()
export class EmployeeFacadeService implements OnDestroy {

  // ===== State =====
  private employeeSubject = new BehaviorSubject<Employee[]>([]);
  private metadataSubject = new BehaviorSubject<EmployeeMetadata>(EMPTY_EMPLOYEE_METADATA);
  private loadingSubject  = new BehaviorSubject<boolean>(false);
  private errorSubject    = new BehaviorSubject<any>(null);
  private destroy$        = new Subject<void>();

  // ===== Public streams =====
  readonly employees$ = this.employeeSubject.asObservable();
  readonly metadata$  = this.metadataSubject.asObservable();
  readonly loading$   = this.loadingSubject.asObservable();
  readonly error$     = this.errorSubject.asObservable();

  constructor(
    private employeeService:  EmployeeService,
    private metadataService:  EmployeeMetadataService,
  ) {}

  // ===== Lifecycle =====
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  initialize(): Observable<EmployeeMetadata> {
    this.setLoading(true);
    this.clearError();

    return this.metadataService.loadAll().pipe(
      tap(metadata => this.metadataSubject.next(metadata)),
      tap(() => this.fetchEmployees()),
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
    this.fetchEmployees();
  }

  filter(criteria: Record<string, any>): void {
    const params = normalizeSearchCriteria(criteria);
    this.fetchEmployees(params);
  }

  // ===== CRUD =====
  create(data: Employee): Observable<Employee> {
    const status = (data as any).employeestatus?.name?.toLowerCase();
    if (status !== 'active') {
      return throwError(() => new Error('Employee must have an active status to be created.'));
    }
    return this.employeeService.save(data);
  }

  update(data: Employee): Observable<Employee> {
    return this.employeeService.update(data);
  }

  deactivate(employees: Employee[]): Observable<number[]> {
    if (!employees || employees.length === 0) {
      return throwError(() => new Error('No employees selected.'));
    }

    const resignedIds = employees
      .filter(e => (e.employeestatus?.name ?? '').toLowerCase() === 'resigned')
      .map(e => e.id)
      .filter((id): id is number => id != null);

    if (resignedIds.length === 0) {
      return throwError(() => new Error('Selected employees cannot be deactivated because none are resigned.'));
    }

    return this.employeeService.deactivate(resignedIds);
  }

  // ===== Pure computation helpers =====
  extractGenderFromNIC(nic: string): 'Male' | 'Female' | null {
    if (!nic) return null;

    const normalized = nic.trim().toUpperCase();

    // New 12-digit NIC format
    if (/^\d{12}$/.test(normalized)) {
      const dayCode = parseInt(normalized.substring(4, 7), 10);
      return dayCode > 500 ? 'Female' : 'Male';
    }

    // Old 9-digit + V NIC format
    if (/^\d{9}[V]$/.test(normalized)) {
      const dayCode = parseInt(normalized.substring(2, 5), 10);
      return dayCode > 500 ? 'Female' : 'Male';
    }

    return null;
  }

  // ===== Internal helpers =====
  private fetchEmployees(params?: any): void {
    this.setLoading(true);
    this.clearError();

    this.employeeService.get(params).pipe(
      map(res => res.data as Employee[]),
      tap(data => this.employeeSubject.next(data)),
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
