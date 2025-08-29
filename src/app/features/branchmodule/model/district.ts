import {Province} from './province';

export  class District{

  id:number;
  name:string;
  province:Province

  constructor(id: number, name: string, province: Province) {
    this.id = id;
    this.name = name;
    this.province = province;
  }



}
