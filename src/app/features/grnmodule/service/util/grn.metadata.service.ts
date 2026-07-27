import {Injectable} from '@angular/core';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {TripExecutionService} from '../../../tripexecution/service/api/tripexecution.service';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {GrnStatusService} from '../api/grnstatus.service';
import {PartRequestService} from '../../../partrequestmodule/service/api/partrequest.service';
import {PartService} from '../../../sparepartmodule/service/api/part.service';
import {GrnMetadata} from '../../model/grn.metadata.model';

@Injectable()
export class GrnMetadataService {

  constructor(
    private grnStatusService:   GrnStatusService,
    private partRequestService: PartRequestService,
    private partService:        PartService,
    private branchService:      BranchService,
  ) {}

  loadAll(): Observable<GrnMetadata> {
    return forkJoin({
      grnStatuses:this.grnStatusService.get().pipe(map(r => r.data)),
      partRequests:this.partRequestService.getSummary().pipe(map(r => r.data)),
      branches:this.branchService.getSummary().pipe(map(r => r.data)),
      parts:this.partService.getSummary().pipe(map(r => r.data)),
    });
  }
}
