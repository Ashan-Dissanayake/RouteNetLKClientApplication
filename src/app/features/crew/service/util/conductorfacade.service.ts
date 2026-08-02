import {Injectable} from '@angular/core';
import {ConductorService} from '../api/conductor.service';
import {Conductor} from '../../entity/conductor';
import {ConductorMapper} from '../../../../shared/mappers/ConductorMapper';
import {ConductorMetadata, EMPTY_CONDUCTOR_METADATA} from '../../model/conductor.metadata.model';
import {ConductorMetadataService} from './conductor.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class ConductorFacadeService extends BaseFacade<Conductor, ConductorMetadata> {

  // ===== Streams =====
  readonly conductors$ = this.items$;

  constructor(
    private conductorService: ConductorService,
    private conductorMetadataService: ConductorMetadataService,
  ) {
    super(
      conductorService,
      conductorMetadataService,
      EMPTY_CONDUCTOR_METADATA,
    );
  }


  // ===== Domain CRUD validation =====
  protected override validateCreate(data: Conductor): string | null {
    const status = data.crewstatus?.name?.toLowerCase();
    if (status !== 'eligible') {
      return 'Conductor must have an eligible status to be created.';
    }
    return null;
  }


  // ===== Entity transformation =====
  protected override beforeCreate(data: Conductor): Conductor {
    return ConductorMapper.fromForm(data);
  }


  protected override beforeUpdate(data: Conductor): Conductor {
    return ConductorMapper.fromForm(data);
  }


  // ===== Snapshot helper =====

  /**
   * Returns the current conductors list synchronously.
   * Used by FormService to derive the employee list for edit mode.
   */
  getConductorsSnapshot(): Conductor[] {
    return this.itemsSubject.getValue();
  }
}
