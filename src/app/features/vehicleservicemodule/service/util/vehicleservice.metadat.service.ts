import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {VehicleServiceStatusService} from '../api/vehicleservicestatus.service';
import {VehicleServiceTypeService} from '../api/vehicleservicetype.service';
import {VehicleServicePriorityService} from '../api/vehicleservicepriority.service';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {IncidentService} from '../../../incidentreportmodule/service/api/incident.service';
import {VehicleService} from '../../../vehiclemodule/service/api/vehicle.service';
import {VehicleServiceMetadata} from '../../model/vehicleservice.metadata.model';
import {PartService} from '../../../sparepartmodule/service/api/part.service';

@Injectable()
export class VehicleServiceMetadataService {

  constructor(
    private branchService: BranchService,
    private vehicleService: VehicleService,
    private incidentService:IncidentService,
    private vehicleServiceStatusService: VehicleServiceStatusService,
    private vehicleServiceTypeService: VehicleServiceTypeService,
    private vehicleServicePriorityService: VehicleServicePriorityService,
    private partService:        PartService,
  ) {}

  loadAll(): Observable<VehicleServiceMetadata> {
    return forkJoin({
      branches: this.branchService.get().pipe(map(r => r.data)),
      vehicles:this.vehicleService.getSummary().pipe(map(r => r.data)),
      incidents:this.incidentService.get().pipe(map(r => r.data)),
      vehicleServiceStatuses:this.vehicleServiceStatusService.get().pipe(map(r => r.data)),
      vehicleServiceTypes:this.vehicleServiceTypeService.get().pipe(map(r => r.data)),
      vehicleServicePriorities:this.vehicleServicePriorityService.get().pipe(map(r => r.data)),
      parts:        this.partService.get().pipe(map(r => r.data))
    });
  }
}
