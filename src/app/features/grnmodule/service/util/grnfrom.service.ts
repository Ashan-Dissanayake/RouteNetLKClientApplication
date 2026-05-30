import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {GrnMetadata} from '../../model/grn.metadata.model';
import {GRN_FILTER_FORM_META, GRN_MAIN_FORM_META} from '../../model/grn.meta';


@Injectable()
export class GrnFormService implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====

  buildFilterForm(metadata: GrnMetadata): FormGroup {
    return this.formBuilder.build([...GRN_FILTER_FORM_META], {
      ssgrnstatus:   metadata.grnStatuses,
      sspartrequest: metadata.partRequests,
    });
  }

  // ===== Main form =====
  //
  // The inner table field (grnpartrequestitems) requires its dataMap
  // to be populated before build() runs so DynamicFieldComponent
  // can render the inner table columns with the correct parts list.
  // This is a side effect on the meta object — we operate on a
  // spread copy to avoid mutating the shared constant.

  buildMainForm(metadata: GrnMetadata): FormGroup {
    const metaCopy = GRN_MAIN_FORM_META.map(f => ({ ...f }));

    const lineField = metaCopy.find(f => f.name === 'grnpartrequestitems');
    if (lineField?.innerTableConfig) {
      lineField.innerTableConfig = {
        ...lineField.innerTableConfig,
        dataMap: { partreqiestitems: metadata.parts },
      };
    }

    return this.formBuilder.build(metaCopy, {});
  }

  // ===== Edit form =====
  // Builds a fresh main form and patches it with the row data.
  // Kept separate from buildMainForm() to make edit intent explicit.

  buildMainFormForEdit(metadata: GrnMetadata, row: any): FormGroup {
    const form = this.buildMainForm(metadata);
    form.patchValue(row);
    return form;
  }
}
