import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BranchStatusService} from '../api/branchstatus.service';
import {BranchTypeService} from '../api/branchtype.service';
import {RegionalOfficeService} from '../api/regionaloffice.service';
import {BranchMetadata} from '../../model/branch.metadata.model';
import {RegexService} from '../../../../core/regex.service';

@Injectable()
export class BranchMetadataService{

  constructor(
    private branchStatusService: BranchStatusService,
    private branchTypeService:BranchTypeService,
    private regionalOfficeService:RegionalOfficeService,
    private regexService:RegexService
  ) {
  }

  loadAll():Observable<BranchMetadata>{
    return forkJoin({
      branchStatuses:this.branchStatusService.get().pipe(map(r=>r.data)),
      branchTypes:this.branchTypeService.get().pipe(map(r=>r.data)),
      regionalOffices:this.regionalOfficeService.get().pipe(map(r=>r.data)),
      regexes:this.regexService.getStaticRegexes('branches').pipe(map(r=>r.data))
    })
}

}
