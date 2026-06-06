import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {IncidentVehicleAllocationStatusService} from '../api/incidenvehicleallocationtstatus.service';
import {IncidentService} from '../../../incidentreportmodule/service/api/incident.service';
import {VehicleService} from '../../../vehiclemodule/service/api/vehicle.service';
import {IncidentVehicleAllocationMetadata} from '../../model/incidentvehicleallocation.metadata.model';

@Injectable()
export class IncidentVehicleAllocationMetadataService {

  constructor(
    private statusService:   IncidentVehicleAllocationStatusService,
    private incidentService: IncidentService,
    private vehicleService:  VehicleService,
    private branchService:   BranchService,
  ) {}

  loadAll(): Observable<IncidentVehicleAllocationMetadata> {
    return forkJoin({
      incidentVehicleAllocationStatuses: this.statusService.get().pipe(map(r => r.data)),
      incidents:this.incidentService.getSummary().pipe(map(r => r.data)),
      vehicles:this.vehicleService.getSummary().pipe(map(r => r.data)),
      branches:this.branchService.getSummary().pipe(map(r => r.data))
    });
  }
}
