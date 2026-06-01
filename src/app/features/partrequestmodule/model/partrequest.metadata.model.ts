import {PartRequestStatus} from '../entity/partrequeststatus';
import {Part} from '../../sparepartmodule/entity/part';
import {Branch} from '../../branchmodule/entity/branch';

export interface PartRequestMetadata {
  partRequestStatuses: PartRequestStatus[];
  parts:               Part[];
  branches:            Branch[];
}

export const EMPTY_PART_REQUEST_METADATA: PartRequestMetadata = {
  partRequestStatuses: [],
  parts:               [],
  branches:            [],
};
