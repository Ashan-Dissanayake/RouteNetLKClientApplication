import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {RosterMetadata} from '../../model/roster.metadata.model';
import {FormGroup} from '@angular/forms';
import {ROSTER_MAIN_FORM_META} from '../../model/roster.meta';

@Injectable()
export class RosterFormService {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildMainForm(
    metadata: RosterMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...ROSTER_MAIN_FORM_META],
      {
        branch: metadata.branches,
      }
    );
  }
}
