import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../shared/util/search-criteria-normalizer';
import {Grn} from '../../entity/grn';
import {GrnService} from '../api/grn.service';
import {EMPTY_GRN_METADATA, GrnMetadata} from '../../model/grn.metadata.model';
import {GrnMetadataService} from './grn.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class GrnFacadeService extends BaseFacade<Grn, GrnMetadata> {

  constructor(
    private grnService: GrnService,
    metadataService: GrnMetadataService,
  ) {
    super(
      grnService,
      metadataService,
      EMPTY_GRN_METADATA
    );
  }
}
