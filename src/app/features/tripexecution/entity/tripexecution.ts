import {Conductor} from '../../crew/entity/conductor';
import {Driver} from '../../crew/entity/driver';
import {Vehicle} from '../../vehiclemodule/entity/vehicle';
import {Trip} from '../../tripmodule/entity/trip';
import {Branch} from '../../branchmodule/entity/branch';
import {TripExecutionStatus} from './tripexecutionstatus';

export class TripExecution{
  id!: number;
  branch!: Branch;
  trip!: Trip;
  vehicle!: Vehicle;
  driver!: Driver;
  conductor!: Conductor;
  doservice!: string;
  toactualdeparture!: string;
  toactualarrival!: string;
  startodometer!: number;
  endodometer!: number;
  passengercount!: number;
  tripno!: number;
  remarks!: string;
  tripexecutionstatus!: TripExecutionStatus;
}
