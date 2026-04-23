import {Trip} from './trip';
import {Vehicle} from '../../vehiclemodule/entity/vehicle';
import {OVerRideStatus} from './overridestatus';

export class TripOverRideVehicle{

    id!:number;
    vehicle!:Vehicle;
    overridestatus!:OVerRideStatus;
    dooverride!:string;

  constructor(id: number, vehicle: Vehicle, overridestatus: OVerRideStatus, dooverride: string) {
    this.id = id;
    this.vehicle = vehicle;
    this.overridestatus = overridestatus;
    this.dooverride = dooverride;
  }
}
