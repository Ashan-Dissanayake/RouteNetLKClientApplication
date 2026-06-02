import {Branch} from '../../branchmodule/entity/branch';
import {TripExecutionStatus} from '../entity/tripexecutionstatus';

export interface TripExecutionMetadata {
  tripExecutionStatuses:TripExecutionStatus[];
  branches:Branch[];
}

export const EMPTY_TRIP_EXECUTION_METADATA: TripExecutionMetadata = {
  tripExecutionStatuses:[],
  branches:[],
};
