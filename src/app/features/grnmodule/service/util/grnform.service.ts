import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {GrnMetadata} from '../../model/grn.metadata.model';
import {GRN_FILTER_FORM_META, GRN_MAIN_FORM_META} from '../../model/grn.meta';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {Grn} from '../../entity/grn';


@Injectable()
export class GrnFormService implements CrudFormService<Grn, GrnMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: GrnMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...GRN_FILTER_FORM_META],
      {
        ssgrnstatus: metadata.grnStatuses,
        sspartrequest: metadata.partRequests,
      }
    );
  }

  buildMainForm(
    metadata: GrnMetadata
  ): FormGroup {

    const metaCopy =
      GRN_MAIN_FORM_META.map(f => ({ ...f }));

    const lineField =
      metaCopy.find(
        f => f.name === 'grnpartrequestitems'
      );

    if (lineField?.innerTableConfig) {

      lineField.innerTableConfig = {
        ...lineField.innerTableConfig,

        dataMap: {
          part: metadata.parts
        },
      };
    }

    return this.formBuilder.build(
      metaCopy,
      {}
    );
  }

  buildMainFormForEdit(
    metadata: GrnMetadata,
    row: Grn
  ): FormGroup {

    const form =
      this.buildMainForm(metadata);

    form.patchValue(row);

    return form;
  }
}
