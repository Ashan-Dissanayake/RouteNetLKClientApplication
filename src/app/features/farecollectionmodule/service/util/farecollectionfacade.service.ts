import {Injectable} from '@angular/core';
import {FareCollection} from '../../entity/farecollection';
import {FareCollectionService} from '../api/farecollection.service';
import {EMPTY_FARE_COLLECTION_METADATA, FareCollectionMetadata} from '../../model/farecollection.metadata.model';
import {FareCollectionMetadataService} from './farecollection.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';
import {Observable} from 'rxjs';

@Injectable()
export class FareCollectionFacadeService extends BaseFacade<FareCollection, FareCollectionMetadata> {

  constructor(
    private fareCollectionService: FareCollectionService,
    private fareCollectionMetadataService: FareCollectionMetadataService
  ) {
    super(
      fareCollectionService,
      fareCollectionMetadataService,
      EMPTY_FARE_COLLECTION_METADATA
    );
  }

  readonly fareCollections$ = this.items$;

  reconciled(row: FareCollection): Observable<FareCollection> {
    return this.fareCollectionService.reconciled(row.id);
  }

}
