import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {EmployeeService} from './services/employee.service';
import {Employee} from './model/employee';

@Injectable({
  providedIn: 'root',
})export class EmployeefacadeService{

  constructor(
   private employeeService:EmployeeService
  ) {}

  // Load data
  loadEmployees(): Observable<Employee[]> {
    return this.getEmployees();
  }

  // Private helpers
  private getEmployees(params?: any): Observable<Employee[]> {
    return this.employeeService.get(params).pipe(map(res => res.data));
  }

}
