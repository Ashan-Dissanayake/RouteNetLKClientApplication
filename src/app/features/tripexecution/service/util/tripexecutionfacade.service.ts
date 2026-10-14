import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, finalize, forkJoin, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {catchError, map} from 'rxjs/operators';
import {Branch} from '../../../branchmodule/entity/branch';
import {TripExecution} from '../../entity/tripexecution';
import {TripExecutionService} from '../api/tripexecution.service';
import {TripExecutionStatusService} from '../api/tripexecutionstatus.service';
import {TripExecutionStatus} from '../../entity/tripexecutionstatus';
import {Part} from '../../../sparepartmodule/entity/part';
import {EMPTY_PART_METADATA, PartMetadata} from '../../../sparepartmodule/model/sparepart.metadata.model';
import {EMPTY_TRIP_EXECUTION_METADATA, TripExecutionMetadata} from '../../model/tripexecution.metadata.model';
import {TripExecutionMetadataService} from './tripexecution.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';


@Injectable()
export class TripExecutionFacadeService extends BaseFacade<TripExecution, TripExecutionMetadata> {

  constructor(
    private tripExecutionService: TripExecutionService,
    metadataService: TripExecutionMetadataService,
  ) {
    super(
      tripExecutionService,
      metadataService,
      EMPTY_TRIP_EXECUTION_METADATA
    );
  }

  initializeTripExecution(
    data: unknown
  ): Observable<TripExecution> {
    return this.tripExecutionService.initialize(data);
  }

  assignResource(
    row: TripExecution
  ): Observable<TripExecution> {

    const payload = {
      branchId: row.branch.id,
      date: row.doservice,
    };

    return this.tripExecutionService.assignedResource(payload);
  }

  checkedIn(id: number): Observable<TripExecution> {
    return this.tripExecutionService.checkedIn(id);
  }

  dispatched(id: number): Observable<TripExecution> {
    return this.tripExecutionService.dispatched(id);
  }

  inProgress(id: number): Observable<TripExecution> {
    return this.tripExecutionService.inProgress(id);
  }

  arrived(id: number): Observable<TripExecution> {
    return this.tripExecutionService.arrived(id);
  }

  breakdown(id: number): Observable<TripExecution> {
    return this.tripExecutionService.breakdown(id);
  }

  completed(id: number): Observable<TripExecution> {
    return this.tripExecutionService.completed(id);
  }

  cancelled(id: number): Observable<TripExecution> {
    return this.tripExecutionService.cancelled(id);
  }
}
