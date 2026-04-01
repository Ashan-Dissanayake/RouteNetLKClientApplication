import {PartCategory} from './partcategory';
import {UnitOfMeasure} from './unitofmeasure';

export class PartMaster{
  id!:number;
  sku!:string;
  name!:string;
  partcategory!:PartCategory;
  unitofmeasure!:UnitOfMeasure;
  constructor(id: number, name: string,sku: string, partcategory: PartCategory, unitofmeasure: UnitOfMeasure) {
    this.id = id;
    this.name = name;
    this.sku = sku;
    this.partcategory =partcategory;
    this.unitofmeasure = unitofmeasure;
  }
}
