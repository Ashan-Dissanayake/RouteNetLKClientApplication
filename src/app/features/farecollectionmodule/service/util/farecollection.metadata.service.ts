import {Injectable} from '@angular/core';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {TripExecutionService} from '../../../tripexecution/service/tripexecution.service';
import {TicketMachineService} from '../api/ticketmachine.service';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FareCollectionMetadata} from '../../model/farecollection.metadata.model';

@Injectable()
export class FareCollectionMetadataService{

  constructor(
    private branchService: BranchService,
    private tripExecutionService:TripExecutionService,
    private ticketMachineService:TicketMachineService,
  ) {
  }

  loadAll():Observable<FareCollectionMetadata>{
    return forkJoin({
      branches:this.branchService.getSummary().pipe(map(r=>r.data)),
      ticketMachines:this.ticketMachineService.get().pipe(map(r=>r.data)),
      tripExecutions:this.tripExecutionService.get().pipe(map(r=>r.data))
    })
}

}
