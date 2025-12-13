export class Make{
  id!:number;
  name!:string
  airconditioned!:boolean

  constructor(id: number, name: string,airconditioned:boolean) {
    this.id = id;
    this.name = name;
    this.airconditioned = airconditioned;
  }
}
