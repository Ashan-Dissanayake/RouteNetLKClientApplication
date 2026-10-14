import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BranchStatusService} from '../api/branchstatus.service';
import {BranchTypeService} from '../api/branchtype.service';
import {RegionalOfficeService} from '../api/regionaloffice.service';
import {BranchMetadata} from '../../model/branch.metadata.model';
import {RegexService} from '../../../../core/regex.service';
import {CrudMetadataService} from '../../../../applicationframework/crudmetadata.service';

@Injectable()
export class BranchMetadataService implements CrudMetadataService<BranchMetadata> {

  constructor(
    private branchStatusService: BranchStatusService,
    private branchTypeService: BranchTypeService,
    private regionalOfficeService: RegionalOfficeService,
    private regexService: RegexService
  ) {}

  loadAll(): Observable<BranchMetadata> {
    return forkJoin({
      branchStatuses: this.branchStatusService
        .get()
        .pipe(map(response => response.data)),

      branchTypes: this.branchTypeService
        .get()
        .pipe(map(response => response.data)),

      regionalOffices: this.regionalOfficeService
        .get()
        .pipe(map(response => response.data)),

      regexes: this.regexService
        .getStaticRegexes('branches')
        .pipe(map(response => response.data))
    });
  }
}
