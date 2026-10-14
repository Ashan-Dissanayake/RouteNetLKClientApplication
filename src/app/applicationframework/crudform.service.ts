import {FormGroup} from '@angular/forms';

export interface CrudFormService<TEntity, TMetadata> {
  buildFilterForm(metadata: TMetadata): FormGroup;

  buildMainForm(metadata: TMetadata): FormGroup;

  buildMainFormForEdit?(
    metadata: TMetadata,
    row: TEntity
  ): FormGroup;
}
