import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {EmployeeService} from './services/employee.service';
import {Employee} from './model/employee';
import {Department} from './model/department';
import {DepartmentService} from './services/department.service';
import {Designation} from './model/designation';
import {DesignationService} from './services/designation.service';
import {Employeetype} from './model/employeetype';
import {EmployeetypeService} from './services/employeetype.service';
import {EmployeestatusService} from './services/employeestatus.service';
import {Employeestatus} from './model/employeestatus';
import {GenderService} from './services/gender.service';
import {Gender} from './model/gender';
import {Branch} from '../branchmodule/model/branch';
import {BranchService} from '../branchmodule/services/branch.service';
import {Regex} from '../../shared/models/regex.model';
import {RegexService} from '../../core/regex.service';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';

@Injectable({
  providedIn: 'root',
})
export class EmployeefacadeService {

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private designationService: DesignationService,
    private employeetypeService: EmployeetypeService,
    private employeestatusService: EmployeestatusService,
    private genderService: GenderService,
    private branchService: BranchService,
    private regexService:RegexService
  ) {
  }

  // Load data
  loadEmployees(): Observable<Employee[]> {
    return this.getEmployees();
  }

  loadDepartments(): Observable<Department[]> {
    return this.departmentService.get().pipe(map(res => res.data));
  }

  loadDesignations(): Observable<Designation[]> {
    return this.designationService.get().pipe(map(res => res.data));
  }

  loadEmployeeType(): Observable<Employeetype[]> {
    return this.employeetypeService.get().pipe(map(res => res.data));
  }

  loadEmployeestatus(): Observable<Employeestatus[]> {
    return this.employeestatusService.get().pipe(map(res => res.data));
  }

  loadGender(): Observable<Gender[]> {
    return this.genderService.get().pipe(map(res => res.data));
  }

  loadBranches(): Observable<Branch[]> {
    return this.branchService.getSummary().pipe(map(res => res.data));
  }

  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('employees').pipe(map(res => res.data));
  }

  searchEmployees(criteria: Record<string, any>): Observable<Employee[]> {
    const normalized = normalizeSearchCriteria(criteria);
    return this.getEmployees(normalized);
  }

  createEmployee(employeeData: any): Observable<Employee> {
    const status = employeeData.employeestatus?.name?.toLowerCase();
    if (status === 'active') {
      return this.employeeService.save(employeeData);
    }
    return throwError(() => new Error('Employee should be active'));
  }

  updateEmployee(employeeData: any): Observable<Employee> {
    return this.employeeService.update(employeeData);
  }

  deleteEmployees(employees: Employee[]): Observable<number[]> {
    if (!employees || employees.length === 0) {
      return throwError(() => new Error('No branches selected'));
    }
    // Collect only closed branch IDs
    const employeeIds = employees
      .filter(e => (e.employeestatus?.name ?? '').toLowerCase() === 'resigned')
      .map(e => e.id)
      .filter(id => id != null);
    if (employeeIds.length === 0) {
      return throwError(() => new Error('Selected employees cannot be deactivated because they are not Resigned'));
    }
    return this.employeeService.deactivate(employeeIds);
  }

  extractGenderFromNIC(nic: string): 'Male' | 'Female' | null {
    if (!nic) return null;

    nic = nic.trim().toUpperCase();

    if (/^\d{12}$/.test(nic)) {
      const dayCode = parseInt(nic.substring(4, 7), 10);
      return dayCode > 500 ? 'Female' : 'Male';
    }

    if (/^\d{9}[Vv]$/.test(nic)) {
      const dayCode = parseInt(nic.substring(2, 5), 10);
      return dayCode > 500 ? 'Female' : 'Male';
    }

    return null;
  }

  generateEmail(callingName: string, employeeNumber: string): string | null {
    if (!callingName || !employeeNumber) return null;

    const cleanName = callingName.trim().toLowerCase().replace(/\s+/g, '.'); // handle spaces
    const cleanEmpNo = employeeNumber.trim().toUpperCase();

    return `${cleanName}.${cleanEmpNo}@sltb.lk`;
  }

  // Private helpers
  private getEmployees(params?: any): Observable<Employee[]> {
    return this.employeeService.get(params).pipe(map(res => res.data));
  }

}
