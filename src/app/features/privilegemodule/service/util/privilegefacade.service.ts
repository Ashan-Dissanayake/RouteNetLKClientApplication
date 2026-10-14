import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../shared/util/search-criteria-normalizer';
import {Privilege} from '../../entity/privilege';
import {EMPTY_PRIVILEGE_LOOK_UP_DATA, PrivilegeLookUpData} from '../../model/privilege.lookupdata.model';
import {PrivilegeService} from '../api/privilege.service';
import {PrivilegeLookUpDataService} from './privilege.lookupdata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class PrivilegeFacadeService extends BaseFacade<Privilege, PrivilegeLookUpData> {

  constructor(
    private privilegeService: PrivilegeService,
    metadataService: PrivilegeLookUpDataService,
  ) {
    super(
      privilegeService,
      metadataService,
      EMPTY_PRIVILEGE_LOOK_UP_DATA
    );
  }

  assignPrivileges(
    roleId: number,
    privileges: {
      module: { id: number };
      operation: { id: number };
    }[]
  ): Observable<any> {

    const payload = {
      privileges
    };

    return this.privilegeService
      .assignPrivileges(roleId, payload);
  }

  revokePrivileges(
    roleId: number,
    privileges: Privilege[]
  ): Observable<any[]> {

    const requests = privileges.map(privilege =>
      this.privilegeService.revokePrivilege(
        roleId,
        privilege.id
      )
    );

    return forkJoin(requests);
  }
}
