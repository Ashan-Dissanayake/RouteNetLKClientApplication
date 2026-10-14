import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {PartMetadata} from '../../model/sparepart.metadata.model';
import {PART_FILTER_FORM_META, PART_MAIN_FORM_META} from '../../model/part.meta';
import {Part} from '../../entity/part';
import {CrudFormService} from '../../../../applicationframework/crudform.service';

@Injectable()
export class PartFormService implements CrudFormService<Part, PartMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: PartMetadata
  ): FormGroup {
    return this.formBuilder.build(
      [...PART_FILTER_FORM_META],
      {
        sspartstatus: metadata.partStatuses,
        sscategory: metadata.partCategories,
      }
    );
  }

  buildMainForm(
    metadata: PartMetadata
  ): FormGroup {
    return this.formBuilder.build(
      [...PART_MAIN_FORM_META],
      {
        branch: metadata.branches,
        partstatus: metadata.partStatuses,
        partcategory: metadata.partCategories,
        partmaster: metadata.partMasters,
        regexes: metadata.regexRules,
      }
    );
  }

  buildMainFormForEdit(
    metadata: PartMetadata,
    row: Part
  ): FormGroup {
    const form = this.buildMainForm(metadata);

    form.patchValue(row);

    return form;
  }
}
