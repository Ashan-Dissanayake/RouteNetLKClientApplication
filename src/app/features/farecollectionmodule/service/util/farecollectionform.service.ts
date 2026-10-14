import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {FareCollectionMetadata} from '../../model/farecollection.metadata.model';
import {FormGroup} from '@angular/forms';
import {FARE_COLLECTION_FILTER_FORM_META, FARE_COLLECTION_MAIN_FORM_META} from '../../model/farecollection.meta';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {FareCollection} from '../../entity/farecollection';


@Injectable()
export class FareCollectionFormService implements CrudFormService<FareCollection, FareCollectionMetadata> {

  constructor(
    private formBuilder: FormbuilderService
  ) {}

  buildFilterForm(
    metadata: FareCollectionMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...FARE_COLLECTION_FILTER_FORM_META],
      {
        sstripexecution: metadata.tripExecutions,
        ssticketmachine: metadata.ticketMachines,
      }
    );
  }

  buildMainForm(
    metadata: FareCollectionMetadata
  ): FormGroup {

    return this.formBuilder.build(
      [...FARE_COLLECTION_MAIN_FORM_META],
      {
        branch: metadata.branches,
        tripexecution: metadata.tripExecutions,
        ticketmachine: metadata.ticketMachines,
      }
    );
  }

  buildMainFormForEdit(
    metadata: FareCollectionMetadata,
    row: FareCollection
  ): FormGroup {

    const form = this.buildMainForm(metadata);

    form.patchValue(row);

    return form;
  }
}
