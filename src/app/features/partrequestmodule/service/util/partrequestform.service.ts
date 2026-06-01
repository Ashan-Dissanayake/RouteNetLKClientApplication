import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {PartRequestMetadata} from '../../model/partrequest.metadata.model';
import {PART_REQUEST_FILTER_FORM_META, PART_REQUEST_MAIN_FORM_META} from '../../model/partrequest.meta';


@Injectable()
export class PartRequestFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====

  buildFilterForm(metadata: PartRequestMetadata): FormGroup {
    return this.formBuilder.build([...PART_REQUEST_FILTER_FORM_META], {
      sspartrequeststatus: metadata.partRequestStatuses,
    });
  }

  // ===== Main form =====
  //
  // The inner table field (partrequestitems) requires its dataMap
  // to be set before build() so the inner table columns render
  // with the correct parts list.
  // We operate on a shallow copy to avoid mutating the shared constant.

  buildMainForm(metadata: PartRequestMetadata): FormGroup {
    const metaCopy = PART_REQUEST_MAIN_FORM_META.map(f => ({ ...f }));

    const lineField = metaCopy.find(f => f.name === 'partrequestitems');
    if (lineField?.innerTableConfig) {
      lineField.innerTableConfig = {
        ...lineField.innerTableConfig,
        dataMap: { part: metadata.parts },
      };
    }

    return this.formBuilder.build(metaCopy, {
      branch:            metadata.branches,
      partrequeststatus: metadata.partRequestStatuses,
    });
  }
}
