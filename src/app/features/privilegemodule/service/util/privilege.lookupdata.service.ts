import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {RoleService} from '../../../usermodule/service/api/role.service';
import {PrivilegeLookUpData} from '../../model/privilege.lookupdata.model';
import {OperationService} from '../api/operation.service';
import {ModuleService} from '../api/module.service';
import {CrudMetadataService} from '../../../../applicationframework/crudmetadata.service';

@Injectable()
export class PrivilegeLookUpDataService implements CrudMetadataService<PrivilegeLookUpData> {

  constructor(
    private roleService: RoleService,
    private operationService: OperationService,
    private moduleService: ModuleService,
  ) {}

  loadAll(): Observable<PrivilegeLookUpData> {
    return forkJoin({
      roles: this.roleService
        .get()
        .pipe(map(response => response.data)),

      operations: this.operationService
        .get()
        .pipe(map(response => response.data)),

      modules: this.moduleService
        .get()
        .pipe(map(response => response.data)),
    });
  }
}
