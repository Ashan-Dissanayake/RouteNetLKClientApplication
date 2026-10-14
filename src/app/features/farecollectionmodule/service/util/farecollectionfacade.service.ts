import {Injectable} from '@angular/core';
import {FareCollection} from '../../entity/farecollection';
import {FareCollectionService} from '../api/farecollection.service';
import {EMPTY_FARE_COLLECTION_METADATA, FareCollectionMetadata} from '../../model/farecollection.metadata.model';
import {FareCollectionMetadataService} from './farecollection.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';
import {Observable} from 'rxjs';

@Injectable()
export class FareCollectionFacadeService extends BaseFacade<FareCollection, FareCollectionMetadata> {

  constructor(
    private fareCollectionService: FareCollectionService,
    metadataService: FareCollectionMetadataService,
  ) {
    super(
      fareCollectionService,
      metadataService,
      EMPTY_FARE_COLLECTION_METADATA
    );
  }

  reconciled(
    row: FareCollection
  ): Observable<FareCollection> {

    return this.fareCollectionService.reconciled(
      row.id
    );
  }
}
