import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {IncidentTypeService} from '../api/incidenttype.service';
import {IncidentStatusService} from '../api/incidentstatus.service';
import {TripExecutionService} from '../../../tripexecution/service/api/tripexecution.service';
import {IncidentMetadata} from '../../model/incidentreport.metadata.model';
import {RegionalOfficeService} from '../../../branchmodule/services/api/regionaloffice.service';

@Injectable()
export class IncidentMetadataService {

  constructor(
    private branchService:         BranchService,
    private incidentTypeService:   IncidentTypeService,
    private incidentStatusService: IncidentStatusService,
    private tripExecutionService:  TripExecutionService,
    private regionalOfficeService: RegionalOfficeService,
  ) {}

  loadAll(): Observable<IncidentMetadata> {
    return forkJoin({
      branches:         this.branchService.getSummary().pipe(map(r => r.data)),
      incidentTypes:    this.incidentTypeService.get().pipe(map(r => r.data)),
      incidentStatuses: this.incidentStatusService.get().pipe(map(r => r.data)),
      tripExecutions:   this.tripExecutionService.getSummary().pipe(map(r => r.data)),
      regionalOffices:  this.regionalOfficeService.get().pipe(map(r => r.data)),
    });
  }
}

