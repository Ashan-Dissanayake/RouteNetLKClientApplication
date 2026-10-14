import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {IncidentTypeService} from '../api/incidenttype.service';
import {IncidentStatusService} from '../api/incidentstatus.service';
import {TripExecutionService} from '../../../tripexecution/service/api/tripexecution.service';
import {IncidentMetadata} from '../../model/incidentreport.metadata.model';
import {RegionalOfficeService} from '../../../branchmodule/services/api/regionaloffice.service';
import {CrudMetadataService} from '../../../../applicationframework/crudmetadata.service';

@Injectable()
export class IncidentMetadataService implements CrudMetadataService<IncidentMetadata> {

  constructor(
    private branchService: BranchService,
    private incidentTypeService: IncidentTypeService,
    private incidentStatusService: IncidentStatusService,
    private tripExecutionService: TripExecutionService,
    private regionalOfficeService: RegionalOfficeService,
  ) {}

  loadAll(): Observable<IncidentMetadata> {

    return forkJoin({

      branches: this.branchService
        .getSummary()
        .pipe(map(response => response.data)),

      incidentTypes: this.incidentTypeService
        .get()
        .pipe(map(response => response.data)),

      incidentStatuses: this.incidentStatusService
        .get()
        .pipe(map(response => response.data)),

      tripExecutions: this.tripExecutionService
        .getSummary()
        .pipe(map(response => response.data)),

      regionalOffices: this.regionalOfficeService
        .get()
        .pipe(map(response => response.data)),
    });
  }
}
