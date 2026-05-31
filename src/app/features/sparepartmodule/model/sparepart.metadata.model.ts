import {PartStatus} from '../entity/partstatus';
import {PartMaster} from '../entity/partmaster';
import {Branch} from '../../branchmodule/entity/branch';
import {PartCategory} from '../entity/partcategory';

export interface PartMetadata {
  partStatuses:PartStatus[];
  partCategories:PartCategory[];
  partMasters:PartMaster[];
  branches:Branch[];
  regexRules:any;
}

export const EMPTY_PART_METADATA: PartMetadata = {
  partStatuses:[],
  partCategories:[],
  partMasters:[],
  branches:[],
  regexRules:{} ,
};
