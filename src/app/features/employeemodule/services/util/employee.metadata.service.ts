import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RegexService} from '../../../../core/regex.service';
import {EmployeeTypeService} from '../api/employeetype.service';
import {EmployeeStatusService} from '../api/employeestatus.service';
import {DesignationService} from '../api/designation.service';
import {GenderService} from '../api/gender.service';
import {DepartmentService} from '../api/department.service';
import {EmployeeMetadata} from '../../model/employee.metadata.model';
import {BranchService} from '../../../branchmodule/services/api/branch.service';

@Injectable()
export class EmployeeMetadataService{

  constructor(
    private employeeTypeService: EmployeeTypeService,
    private employeeStatusService:EmployeeStatusService,
    private designationService:DesignationService,
    private genderService:GenderService,
    private departmentService:DepartmentService,
    private branchService:BranchService,
    private regexService:RegexService
  ) {
  }

  loadAll():Observable<EmployeeMetadata>{
    return forkJoin({
      employeeTypes:this.employeeTypeService.get().pipe(map(r=>r.data)),
      employeeStatuses:this.employeeStatusService.get().pipe(map(r=>r.data)),
      designations:this.designationService.get().pipe(map(r=>r.data)),
      genders:this.genderService.get().pipe(map(r=>r.data)),
      departments:this.departmentService.get().pipe(map(r=>r.data)),
      branches:this.branchService.getSummary().pipe(map(r=>r.data)),
      regexes:this.regexService.getStaticRegexes('branches').pipe(map(r=>r.data))
    })
}

}
