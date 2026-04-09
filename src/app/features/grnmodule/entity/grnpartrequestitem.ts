import {Part} from '../../sparepartmodule/entity/part';
import {PartRequestItem} from '../../partrequestmodule/entity/partrequestitem';

export class GrnPartRequestItem {
  id!:number;
  partrequestitem!:PartRequestItem;
  quantity!:number;

  constructor(id:number,partrequestitem:PartRequestItem,quantity:number) {
    this.id = id;
    this.partrequestitem = partrequestitem;
    this.quantity = quantity;
  }
}
