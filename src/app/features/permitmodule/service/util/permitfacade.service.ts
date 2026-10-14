import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Permit} from '../../entity/permit';
import {PermitService} from '../api/permit.service';
import {EMPTY_PERMIT_METADATA, PermitMetadata} from '../../model/permit.metadata.model';
import {PermitMetadataService} from './permit.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class PermitFacadeService extends BaseFacade<Permit, PermitMetadata> {

  constructor(
    private permitService: PermitService,
    metadataService: PermitMetadataService,
  ) {
    super(
      permitService,
      metadataService,
      EMPTY_PERMIT_METADATA
    );
  }

  transfer(permitId: number): Observable<Permit> {
    return this.permitService.transferPermit(permitId);
  }
}
