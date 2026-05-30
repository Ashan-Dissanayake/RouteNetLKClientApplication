import {GrnStatus} from '../entity/grnstatus';
import {PartRequest} from '../../partrequestmodule/entity/partrequest';
import {Branch} from '../../branchmodule/entity/branch';
import {Part} from '../../sparepartmodule/entity/part';

export interface GrnMetadata {
  grnStatuses:  GrnStatus[];
  partRequests: PartRequest[];
  branches:     Branch[];
  parts:        Part[];
}

export const EMPTY_GRN_METADATA: GrnMetadata = {
  grnStatuses:  [],
  partRequests: [],
  branches:     [],
  parts:        [],
};
