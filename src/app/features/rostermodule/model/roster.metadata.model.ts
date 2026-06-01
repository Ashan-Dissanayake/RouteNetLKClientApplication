import {Branch} from '../../branchmodule/entity/branch';

export interface RosterMetadata {
  branches: Branch[];
}

export const EMPTY_ROSTER_METADATA: RosterMetadata = {
  branches: [],
};
