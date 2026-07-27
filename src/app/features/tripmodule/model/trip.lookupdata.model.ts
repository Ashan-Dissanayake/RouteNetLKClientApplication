import {Branch} from '../../branchmodule/entity/branch';
import {TripType} from '../entity/triptype';
import {TripStatus} from '../entity/tripstatus';
import {Permit} from '../../permitmodule/entity/permit';
import {OpCalender} from '../entity/opcalender';
import {OriginTerminal} from '../entity/originterminal';
import {Shift} from '../../rostermodule/entity/shift';

/**
   * Interface representing the lookup data model for trips.
   * This model contains various collections of data required for trip-related operations,
   * such as branches, trip types, statuses, permits, operational calendars, origin terminals, and shifts.
   */
  export interface TripLookUpDataModel {
    branches:        Branch[];
    tripTypes:       TripType[];
    tripStatuses:    TripStatus[];
    permits:         Permit[];
    opCalenders:     OpCalender[];
    originTerminals: OriginTerminal[];
    shifts: Shift[];
  }

  /**
   * Constant representing an empty state of the `TripLookUpDataModel`.
   * This is used as a default or placeholder value for the model.
   */
  export const EMPTY_TRIP_METADATA: TripLookUpDataModel = {
    branches:        [],
    tripTypes:       [],
    tripStatuses:    [],
    permits:         [],
    opCalenders:     [],
    originTerminals: [],
    shifts:[]
  };
