import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {PartRequestMetadata} from '../../model/partrequest.metadata.model';
import {PART_REQUEST_FILTER_FORM_META, PART_REQUEST_MAIN_FORM_META} from '../../model/partrequest.meta';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {PartRequest} from '../../entity/partrequest';


@Injectable()
export class PartRequestFormService implements CrudFormService<PartRequest, PartRequestMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: PartRequestMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...PART_REQUEST_FILTER_FORM_META],
      {
        sspartrequeststatus:
        metadata.partRequestStatuses,
      }
    );
  }

  buildMainForm(
    metadata: PartRequestMetadata
  ): FormGroup {

    const metaCopy =
      PART_REQUEST_MAIN_FORM_META.map(
        field => ({ ...field })
      );

    const lineField =
      metaCopy.find(
        field => field.name === 'partrequestitems'
      );

    if (lineField?.innerTableConfig) {
      lineField.innerTableConfig = {
        ...lineField.innerTableConfig,

        dataMap: {
          part: metadata.parts,
        },
      };
    }

    return this.formBuilder.build(
      metaCopy,
      {
        branch: metadata.branches,
        partrequeststatus:
        metadata.partRequestStatuses,
      }
    );
  }

  buildMainFormForEdit(
    metadata: PartRequestMetadata,
    row: PartRequest
  ): FormGroup {

    const form =
      this.buildMainForm(metadata);

    form.patchValue(row);

    return form;
  }
}
