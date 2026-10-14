import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {TripExecutionStatusService} from '../api/tripexecutionstatus.service';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {TripExecutionMetadata} from '../../model/tripexecution.metadata.model';
import {CrudMetadataService} from '../../../../applicationframework/crudmetadata.service';

@Injectable()
export class TripExecutionMetadataService implements CrudMetadataService<TripExecutionMetadata> {

  constructor(
    private tripExecutionStatusService: TripExecutionStatusService,
    private branchService: BranchService,
  ) {}

  loadAll(): Observable<TripExecutionMetadata> {
    return forkJoin({
      tripExecutionStatuses: this.tripExecutionStatusService
        .get()
        .pipe(map(response => response.data)),

      branches: this.branchService
        .getSummary()
        .pipe(map(response => response.data)),
    });
  }
}
