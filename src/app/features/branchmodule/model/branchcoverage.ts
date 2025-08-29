import {District} from './district';

export class Branchcoverage{

  id!:number;
  district!:District;

  constructor(id: number, district: District) {
    this.id = id;
    this.district = district;
  }
}
