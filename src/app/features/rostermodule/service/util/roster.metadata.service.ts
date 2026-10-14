import {Injectable} from '@angular/core';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {forkJoin, Observable} from 'rxjs';
import {RosterMetadata} from '../../model/roster.metadata.model';
import {map} from 'rxjs/operators';
import {CrudMetadataService} from '../../../../applicationframework/crudmetadata.service';

@Injectable()
export class RosterMetadataService implements CrudMetadataService<RosterMetadata>{

  constructor(private branchService: BranchService) {}

  loadAll(): Observable<RosterMetadata> {
    return forkJoin({
      branches: this.branchService
        .getSummary()
        .pipe(map(r => r.data)),
    });
  }
}
