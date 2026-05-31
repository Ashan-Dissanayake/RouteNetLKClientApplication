import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {PartMetadata} from '../../model/sparepart.metadata.model';
import {PART_FILTER_FORM_META, PART_MAIN_FORM_META} from '../../model/part.meta';
import {Part} from '../../entity/part';

@Injectable()
export class PartFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====

  buildFilterForm(metadata: PartMetadata): FormGroup {
    return this.formBuilder.build([...PART_FILTER_FORM_META], {
      sspartstatus: metadata.partStatuses,
      sscategory: metadata.partCategories,
    });
  }

  // ===== Main form =====

  buildMainForm(metadata: PartMetadata): FormGroup {
    return this.formBuilder.build([...PART_MAIN_FORM_META], {
      branch:      metadata.branches,
      partstatus:  metadata.partStatuses,
      partcategory:  metadata.partCategories,
      partmaster:  metadata.partMasters,
      regexes:     metadata.regexRules,
    });
  }

  // ===== Edit form =====

  buildMainFormForEdit(metadata: PartMetadata, row: Part): FormGroup {
    const form = this.buildMainForm(metadata);
    form.patchValue(row);
    return form;
  }
}
