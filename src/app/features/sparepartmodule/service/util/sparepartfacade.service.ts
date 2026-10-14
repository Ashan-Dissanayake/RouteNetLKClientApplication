import {Injectable} from '@angular/core';
import {Part} from '../../entity/part';
import {PartService} from '../api/part.service';
import {EMPTY_PART_METADATA, PartMetadata} from '../../model/sparepart.metadata.model';
import {PartMetadataService} from './sparepart.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class SparePartFacadeService extends BaseFacade<Part, PartMetadata> {

  constructor(
    private partService: PartService,
    metadataService: PartMetadataService,
  ) {
    super(
      partService,
      metadataService,
      EMPTY_PART_METADATA
    );
  }

  protected override getDeactivationIds(
    parts: Part[]
  ): number[] {
    return parts
      .map(part => part.id)
      .filter((id): id is number => id != null);
  }

  protected override getNoQualifyingDeactivateErrorMessage(): string {
    return 'No parts selected for deactivation.';
  }
}
