import {Branch} from '../../branchmodule/entity/branch';
import {TicketMachine} from '../entity/ticketmachine';
import {TripExecution} from '../../tripexecution/entity/tripexecution';

export interface FareCollectionMetadata{
  branches:Branch[];
  ticketMachines:TicketMachine[];
  tripExecutions:TripExecution[]
}

export const EMPTY_FARE_COLLECTION_METADATA: FareCollectionMetadata = {
  branches: [],
  ticketMachines: [],
  tripExecutions: []
}
