export class Model{
  id!:number;
  name!:string;
  model!:Model;

  constructor(id: number, name: string,model:Model) {
    this.id = id;
    this.name = name;
    this.model = model;
  }
}
