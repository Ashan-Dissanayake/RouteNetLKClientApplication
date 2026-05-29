import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FareCollectionMetadata} from '../../model/farecollection.metadata.model';
import {FormGroup} from '@angular/forms';
import {FARE_COLLECTION_FILTER_FORM_META, FARE_COLLECTION_MAIN_FORM_META} from '../../model/farecollection.meta';


@Injectable()
export class FareCollectionFromService{

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormbuilderService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(metadata: FareCollectionMetadata): FormGroup {
    return this.formBuilder.build([...FARE_COLLECTION_FILTER_FORM_META], {
      sstripexecution: metadata.tripExecutions,
      ssticketmachine:  metadata.ticketMachines,
    });
  }

  // ===== Main form =====

  buildMainForm(metadata: FareCollectionMetadata): FormGroup {
    return this.formBuilder.build([...FARE_COLLECTION_MAIN_FORM_META], {
      branch:metadata.branches,
      tripexecution:metadata.tripExecutions,
      ticketmachine:metadata.ticketMachines,
    });
  }

}
