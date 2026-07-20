import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {PrivilegeLookUpData} from '../../model/privilege.lookupdata.model';
import {PRIVILEGE_FILTER_FORM_META, PRIVILEGE_MAIN_FORM_META} from '../../model/privilege.meta';

@Injectable()
export class PrivilegeFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormbuilderService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(lookUpData: PrivilegeLookUpData): FormGroup {
    return this.formBuilder.build([...PRIVILEGE_FILTER_FORM_META], {
      ssrole: lookUpData.roles,
      ssmodule: lookUpData.modules,
      ssoperation: lookUpData.operations,
    });
  }

  // ===== Main form =====
  buildMainForm(lookUpData: PrivilegeLookUpData): FormGroup {
    return this.formBuilder.build([...PRIVILEGE_MAIN_FORM_META], {
      role: lookUpData.roles,
      module: lookUpData.modules,
      operation: lookUpData.operations,
    });
  }

}


