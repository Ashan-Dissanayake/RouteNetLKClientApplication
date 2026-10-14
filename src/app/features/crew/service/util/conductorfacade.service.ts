import {Injectable} from '@angular/core';
import {ConductorService} from '../api/conductor.service';
import {Conductor} from '../../entity/conductor';
import {ConductorMapper} from './ConductorMapper';
import {ConductorMetadata, EMPTY_CONDUCTOR_METADATA} from '../../model/conductor.metadata.model';
import {ConductorMetadataService} from './conductor.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class ConductorFacadeService extends BaseFacade<Conductor, ConductorMetadata> {

  constructor(
    private conductorService: ConductorService,
    metadataService: ConductorMetadataService,
  ) {
    super(
      conductorService,
      metadataService,
      EMPTY_CONDUCTOR_METADATA,
    );
  }

  protected override validateCreate(
    data: Conductor
  ): string | null {

    const status =
      data.crewstatus?.name?.toLowerCase();

    if (status !== 'eligible') {
      return 'Conductor must have an eligible status to be created.';
    }

    return null;
  }

  protected override beforeCreate(
    data: Conductor
  ): Conductor {
    return ConductorMapper.fromForm(data);
  }

  protected override beforeUpdate(
    data: Conductor
  ): Conductor {
    return ConductorMapper.fromForm(data);
  }

  getConductorsSnapshot(): Conductor[] {
    return this.itemsSubject.getValue();
  }
}
