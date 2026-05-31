import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {PartStatusService} from '../api/partstatus.service';
import {PartMasterService} from '../api/partmaster.service';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {RegexService} from '../../../../core/regex.service';
import {PartMetadata} from '../../model/sparepart.metadata.model';
import {PartCategoryService} from '../api/partcategory.service';

@Injectable()
export class PartMetadataService {

  constructor(
    private partStatusService: PartStatusService,
    private partCategoryService: PartCategoryService,
    private partMasterService: PartMasterService,
    private branchService:     BranchService,
    private regexService:      RegexService,
  ) {}

  loadAll(): Observable<PartMetadata> {
    return forkJoin({
      partStatuses: this.partStatusService.get().pipe(map(r => r.data)),
      partCategories: this.partCategoryService.get().pipe(map(r => r.data)),
      partMasters:  this.partMasterService.get().pipe(map(r => r.data)),
      branches:     this.branchService.getSummary().pipe(map(r => r.data)),
      regexRules:   this.regexService.getStaticRegexes('parts').pipe(map(r => r.data)),
    });
  }
}
