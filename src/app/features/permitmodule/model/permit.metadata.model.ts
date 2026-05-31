import {PermitStatus} from '../entity/permitstatus';
import {ServiceType} from '../entity/servicetype';
import {Route} from '../entity/route';
import {Vehicle} from '../../vehiclemodule/entity/vehicle';
import {Branch} from '../../branchmodule/entity/branch';

export interface PermitMetadata {
  permitStatuses:PermitStatus[];
  serviceTypes:ServiceType[];
  routes:Route[];
  vehicles:Vehicle[];
  branches: Branch[];
  regexes:any;
}

export const EMPTY_PERMIT_METADATA: PermitMetadata = {
  permitStatuses:[],
  serviceTypes:[],
  routes:[],
  vehicles:[],
  branches:[],
  regexes:{},
};
