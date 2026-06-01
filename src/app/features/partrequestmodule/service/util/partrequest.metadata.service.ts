import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {PartRequestStatusService} from '../api/partrequeststatus.service';
import {PartService} from '../../../sparepartmodule/service/api/part.service';
import {PartRequestMetadata} from '../../model/partrequest.metadata.model';

@Injectable()
export class PartRequestMetadataService {

  constructor(
    private partRequestStatusService: PartRequestStatusService,
    private partService:              PartService,
    private branchService:            BranchService,
  ) {}

  loadAll(): Observable<PartRequestMetadata> {
    return forkJoin({
      partRequestStatuses: this.partRequestStatusService.get().pipe(map(r => r.data)),
      parts:               this.partService.getSummary().pipe(map(r => r.data)),
      branches:            this.branchService.getSummary().pipe(map(r => r.data)),
    });
  }
}
