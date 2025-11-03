import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {EmployeeService} from './services/employee.service';
import {Employee} from './model/employee';
import {Department} from './model/department';
import {DepartmentService} from './services/department.service';

@Injectable({
  providedIn: 'root',
})export class EmployeefacadeService{

  constructor(
   private employeeService:EmployeeService,
   private departmentService:DepartmentService
  ) {}

  // Load data
  loadEmployees(): Observable<Employee[]> {
    return this.getEmployees();
  }

  loadDepartments(): Observable<Department[]> {
    return this.departmentService.get().pipe(map(res => res.data));
  }

  searchEmployees(criteria: any): Observable<Employee[]> {
    const normalized = this.normalizeSearchCriteria(criteria);
    console.log(criteria)
    return this.getEmployees(normalized);
  }

  // Private helpers
  private getEmployees(params?: any): Observable<Employee[]> {
    return this.employeeService.get(params).pipe(map(res => res.data));
  }

  private normalizeSearchCriteria(criteria: any): any {
    return Object.fromEntries(
      Object.entries(criteria).map(([key, value]) => {
        if (typeof value === 'string') return [key, value.trim().toLowerCase()];
        if (value && typeof value === 'object' && 'id' in value) return [key, value.id];
        return [key, value];
      })
    );
  }

}
