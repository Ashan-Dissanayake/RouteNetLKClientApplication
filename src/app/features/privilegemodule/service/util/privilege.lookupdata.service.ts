import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {RoleService} from '../../../usermodule/service/api/role.service';
import {PrivilegeLookUpData} from '../../model/privilege.lookupdata.model';
import {OperationService} from '../api/operation.service';
import {ModuleService} from '../api/module.service';

@Injectable()
export class PrivilegeLookUpDataService {

  constructor(
    private roleService: RoleService,
    private operationService: OperationService,
    private moduleService: ModuleService,
  ) {}

  loadAll(): Observable<PrivilegeLookUpData> {
    return  forkJoin({
      roles: this.roleService.get().pipe(map(r => r.data)),
      operations: this.operationService.get().pipe(map(r => r.data)),
      modules: this.moduleService.get().pipe(map(r => r.data))
    });
  }
}
