import {Injectable} from '@angular/core';
import {Part} from '../../entity/part';
import {PartService} from '../api/part.service';
import {EMPTY_PART_METADATA, PartMetadata} from '../../model/sparepart.metadata.model';
import {PartMetadataService} from './sparepart.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class SparePartFacadeService extends BaseFacade<Part, PartMetadata> {

  constructor(
    private partService: PartService,
    private sparePartMetadataService: PartMetadataService,
  ) {
    super(
      partService,
      sparePartMetadataService,
      EMPTY_PART_METADATA
    );
  }

  readonly parts$ = this.items$;


  protected override getDeactivationIds(parts: Part[]): number[] {

    return parts
      .map(p => p.id!)
      .filter(id => id != null);
  }


  protected override getNoQualifyingDeactivateErrorMessage(): string {
    return 'No parts selected for deactivation.';
  }

}
