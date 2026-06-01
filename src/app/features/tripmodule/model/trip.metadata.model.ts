import {Branch} from '../../branchmodule/entity/branch';
import {TripType} from '../entity/triptype';
import {TripStatus} from '../entity/tripstatus';
import {Permit} from '../../permitmodule/entity/permit';
import {OpCalender} from '../entity/opcalender';
import {OriginTerminal} from '../entity/originterminal';

export interface TripMetadata {
  branches:        Branch[];
  tripTypes:       TripType[];
  tripStatuses:    TripStatus[];
  permits:         Permit[];
  opCalenders:     OpCalender[];
  originTerminals: OriginTerminal[];
}

export const EMPTY_TRIP_METADATA: TripMetadata = {
  branches:        [],
  tripTypes:       [],
  tripStatuses:    [],
  permits:         [],
  opCalenders:     [],
  originTerminals: [],
};
