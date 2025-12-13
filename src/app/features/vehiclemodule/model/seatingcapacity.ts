import {Make} from './make';

export class Seatingcapacity{
  id!:number;
  amount!:number
  make!:Make

  constructor(id: number, amount: number,make:Make) {
    this.id = id;
    this.amount = amount;
    this.make = make;
  }
}
