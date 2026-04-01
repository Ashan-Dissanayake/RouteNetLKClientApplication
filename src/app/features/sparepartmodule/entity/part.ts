import {Branch} from '../../branchmodule/entity/branch';
import {PartCategory} from './partcategory';
import {UnitOfMeasure} from './unitofmeasure';
import {PartStatus} from './partstatus';
import {PartMaster} from './partmaster';

export class Part{
  id!:number;
  branch!:Branch;
  partmaster!:PartMaster
  qoh!:number;
  maxlevel!:number;
  rop!:number;
  dolastordered!:string;
  remarks!:string;
  partstatus!:PartStatus;
}
