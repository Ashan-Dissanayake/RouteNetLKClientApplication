import {Injectable} from '@angular/core';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {TripExecutionService} from '../../../tripexecution/service/api/tripexecution.service';
import {TicketMachineService} from '../api/ticketmachine.service';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FareCollectionMetadata} from '../../model/farecollection.metadata.model';
import {CrudMetadataService} from '../../../../applicationframework/crudmetadata.service';

@Injectable()
export class FareCollectionMetadataService
  implements CrudMetadataService<FareCollectionMetadata> {

  constructor(
    private branchService: BranchService,
    private tripExecutionService: TripExecutionService,
    private ticketMachineService: TicketMachineService,
  ) {}

  loadAll(): Observable<FareCollectionMetadata> {

    return forkJoin({

      branches: this.branchService
        .getSummary()
        .pipe(map(response => response.data)),

      ticketMachines: this.ticketMachineService
        .get()
        .pipe(map(response => response.data)),

      tripExecutions: this.tripExecutionService
        .get()
        .pipe(map(response => response.data)),
    });
  }
}
