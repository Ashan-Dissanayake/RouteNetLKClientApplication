import {Part} from '../../sparepartmodule/entity/part';

export class PartRequestItem {
  id!:number;
  part!:Part;
  quantity!:number;

  constructor(id:number,part:Part,quantity:number) {
    this.id = id;
    this.part = part;
    this.quantity = quantity;
  }
}
