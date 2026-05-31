import {Injectable} from '@angular/core';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {PermitStatusService} from '../api/permitstatus.service';
import {ServiceTypeService} from '../api/servicetype.service';
import {RouteService} from '../api/route.service';
import {VehicleService} from '../../../vehiclemodule/service/vehicle.service';
import {RegexService} from '../../../../core/regex.service';
import {PermitMetadata} from '../../model/permit.metadata.model';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class PermitMetadataService {

  constructor(
    private permitStatusService:PermitStatusService,
    private serviceTypeService:ServiceTypeService,
    private routeService:RouteService,
    private vehicleService:VehicleService,
    private branchService:BranchService,
    private regexService:RegexService,
  ) {}

  loadAll(): Observable<PermitMetadata> {
    return forkJoin({
      permitStatuses:this.permitStatusService.get().pipe(map(r => r.data)),
      serviceTypes:this.serviceTypeService.get().pipe(map(r => r.data)),
      routes:this.routeService.get().pipe(map(r => r.data)),
      vehicles:this.vehicleService.getSummary().pipe(map(r => r.data)),
      branches:this.branchService.getSummary().pipe(map(r => r.data)),
      regexes:this.regexService.getStaticRegexes('permits').pipe(map(r => r.data)),
    });
  }
}
