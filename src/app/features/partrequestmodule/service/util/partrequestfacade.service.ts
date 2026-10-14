import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {normalizeSearchCriteria} from '../../../../shared/util/search-criteria-normalizer';
import {PartRequest} from '../../entity/partrequest';
import {PartRequestService} from '../api/partrequest.service';
import {EMPTY_PART_REQUEST_METADATA, PartRequestMetadata} from '../../model/partrequest.metadata.model';
import {PartRequestMetadataService} from './partrequest.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';


@Injectable()
export class PartRequestFacadeService extends BaseFacade<PartRequest, PartRequestMetadata> {

  constructor(
    private partRequestService: PartRequestService,
    metadataService: PartRequestMetadataService,
  ) {
    super(
      partRequestService,
      metadataService,
      EMPTY_PART_REQUEST_METADATA
    );
  }

  approve(
    partRequest: PartRequest
  ): Observable<PartRequest> {
    return this.partRequestService.approveRequest(
      partRequest.id
    );
  }

  reject(
    partRequest: PartRequest
  ): Observable<PartRequest> {
    return this.partRequestService.rejectRequest(
      partRequest.id
    );
  }
}
