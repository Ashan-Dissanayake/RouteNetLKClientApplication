import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {PermitMetadata} from '../../model/permit.metadata.model';
import {PERMIT_FILTER_FORM_META, PERMIT_MAIN_FORM_META} from '../../model/permit.meta';


@Injectable()
export class PermitFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====

  buildFilterForm(metadata: PermitMetadata): FormGroup {
    return this.formBuilder.build([...PERMIT_FILTER_FORM_META], {
      sspermitstatus: metadata.permitStatuses,
      ssroute:        metadata.routes,
    });
  }

  // ===== Main form =====

  buildMainForm(metadata: PermitMetadata): FormGroup {
    return this.formBuilder.build([...PERMIT_MAIN_FORM_META], {
      vehicle:       metadata.vehicles,
      branch:        metadata.branches,
      permitestatus: metadata.permitStatuses,
      servicetype:   metadata.serviceTypes,
      route:         metadata.routes,
      regexes:       metadata.regexes,
    });
  }
}
