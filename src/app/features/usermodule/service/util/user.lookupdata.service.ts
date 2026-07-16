import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {UserStatusService} from '../api/userstatus.service';
import {UserTypeService} from '../api/usertype.service';
import {RegexService} from '../../../../core/regex.service';
import {EmployeeService} from '../../../employeemodule/services/api/employee.service';
import {UserLookUpData} from '../../model/user.lookupdata.model';

@Injectable()
export class UserLookUpDataService {

  constructor(
    private employeeService: EmployeeService,
    private userStatusService: UserStatusService,
    private userTypeService: UserTypeService,
    private regexService:      RegexService,
  ) {}

  loadAll(): Observable<UserLookUpData> {
    return  forkJoin({
      employees: this.employeeService.getSummary().pipe(map(r => r.data)),
      userStatuses: this.userStatusService.get().pipe(map(r => r.data)),
      userTypes: this.userTypeService.get().pipe(map(r => r.data)),
      regexes:this.regexService.getStaticRegexes('users').pipe(map(r=>r.data))
    });
  }
}
