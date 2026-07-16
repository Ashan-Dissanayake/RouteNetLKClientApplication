import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {TripTypeService} from '../api/triptype.service';
import {TripStatusService} from '../api/tripstatus.service';
import {PermitService} from '../../../permitmodule/service/api/permit.service';
import {OpCalenderService} from '../api/opcalender.service';
import {OriginTerminalService} from '../api/originterminal.service';
import {TripMetadata} from '../../model/trip.metadata.model';

/**
 * Service to load lookup data for trips.
 * This service aggregates data from multiple other services
 * and provides it as a single observable.
 */
@Injectable()
export class TripLookupDataService {
  /**
   * Constructor for `TripLookupDataService`.
   * @param branchService Service to fetch branch-related data.
   * @param tripTypeService Service to fetch trip type data.
   * @param tripStatusService Service to fetch trip status data.
   * @param permitService Service to fetch permit-related data.
   * @param opCalenderService Service to fetch operational calendar data.
   * @param originTerminalService Service to fetch origin terminal data.
   */
  constructor(
    private branchService:         BranchService,
    private tripTypeService:        TripTypeService,
    private tripStatusService:      TripStatusService,
    private permitService:          PermitService,
    private opCalenderService:      OpCalenderService,
    private originTerminalService:  OriginTerminalService,
  ) {}
  /**
   * Loads all lookup data required for trips.
   * @returns An observable of `TripMetadata` containing aggregated data
   * from various services.
   */
  loadAll(): Observable<TripMetadata> {
    return forkJoin({
      branches:        this.branchService.getSummary().pipe(map(r => r.data)),
      tripTypes:       this.tripTypeService.get().pipe(map(r => r.data)),
      tripStatuses:    this.tripStatusService.get().pipe(map(r => r.data)),
      permits:         this.permitService.getSummary().pipe(map(r => r.data)),
      opCalenders:     this.opCalenderService.get().pipe(map(r => r.data)),
      originTerminals: this.originTerminalService.get().pipe(map(r => r.data)),
    });
  }
}


