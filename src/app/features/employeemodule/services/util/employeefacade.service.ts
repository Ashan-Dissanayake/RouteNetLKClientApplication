import {Injectable} from '@angular/core';
import {EmployeeService} from '../api/employee.service';
import {Employee} from '../../entity/employee';
import {EmployeeMetadata, EMPTY_EMPLOYEE_METADATA} from '../../model/employee.metadata.model';
import {EmployeeMetadataService} from './employee.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class EmployeeFacadeService extends BaseFacade<Employee, EmployeeMetadata> {

  constructor(
    private employeeService: EmployeeService,
    metadataService: EmployeeMetadataService,
  ) {
    super(
      employeeService,
      metadataService,
      EMPTY_EMPLOYEE_METADATA
    );
  }

  protected override validateCreate(
    data: Employee
  ): string | null {

    const status =
      (data.employeestatus?.name ?? '').toLowerCase();

    if (status !== 'active') {
      return 'Employee must have an active status to be created.';
    }

    return null;
  }

  protected override getDeactivationIds(
    employees: Employee[]
  ): number[] {

    return employees
      .filter(employee =>
        (employee.employeestatus?.name ?? '').toLowerCase() === 'resigned'
      )
      .map(employee => employee.id)
      .filter(
        (id): id is number => id != null
      );
  }

  protected override getNoQualifyingDeactivateErrorMessage(): string {
    return 'Selected employees cannot be deactivated because none are resigned.';
  }

  extractGenderFromNIC(
    nic: string
  ): 'Male' | 'Female' | null {

    if (!nic) {
      return null;
    }

    const normalized = nic.trim().toUpperCase();

    // New 12-digit NIC format
    if (/^\d{12}$/.test(normalized)) {
      const dayCode = parseInt(
        normalized.substring(4, 7),
        10
      );

      return dayCode > 500
        ? 'Female'
        : 'Male';
    }

    // Old 9-digit + V NIC format
    if (/^\d{9}V$/.test(normalized)) {
      const dayCode = parseInt(
        normalized.substring(2, 5),
        10
      );

      return dayCode > 500
        ? 'Female'
        : 'Male';
    }

    return null;
  }
}
