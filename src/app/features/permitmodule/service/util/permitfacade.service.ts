import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Permit} from '../../entity/permit';
import {PermitService} from '../api/permit.service';
import {EMPTY_PERMIT_METADATA, PermitMetadata} from '../../model/permit.metadata.model';
import {PermitMetadataService} from './permit.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class PermitFacadeService extends BaseFacade<Permit, PermitMetadata> {

  readonly permits$ = this.items$;

  constructor(
    private permitService: PermitService,
    private permitMetadataService: PermitMetadataService,
  ) {
    super(
      permitService,
      permitMetadataService,
      EMPTY_PERMIT_METADATA
    );
  }

  // ===== Domain operations =====
  /**
   * Permit transfer is not a CRUD operation.
   * It is a domain workflow operation,
   * therefore it remains inside facade.
   */
  transfer(permitId: number): Observable<Permit> {
    return this.permitService.transferPermit(permitId);
  }

  // ===== Optional domain validations =====
  protected override validateCreate(data: Permit): string | null {
    return null;
  }

  // ===== Optional payload transformations =====
  protected override beforeCreate(data: Permit): Permit {
    return data;
  }

  protected override beforeUpdate(data: Permit): Permit {
    return data;
  }
}
