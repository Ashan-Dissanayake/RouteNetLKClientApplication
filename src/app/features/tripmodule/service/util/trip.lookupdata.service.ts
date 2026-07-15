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

@Injectable()
export class TripMetadataService {

  constructor(
    private branchService:         BranchService,
    private tripTypeService:        TripTypeService,
    private tripStatusService:      TripStatusService,
    private permitService:          PermitService,
    private opCalenderService:      OpCalenderService,
    private originTerminalService:  OriginTerminalService,
  ) {}

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
