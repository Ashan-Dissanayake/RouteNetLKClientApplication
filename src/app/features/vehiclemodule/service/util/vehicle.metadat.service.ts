import {Injectable} from '@angular/core';
import {VehiclestatusService} from '../api/vehiclestatus.service';
import {MakeService} from '../api/make.service';
import {ModelService} from '../api/model.service';
import {FueltypeService} from '../api/fueltype.service';
import {BustypeService} from '../api/bustype.service';
import {BranchService} from '../../../branchmodule/services/api/branch.service';
import {ConditionRateService} from '../api/conditionrate.service';
import {RegexService} from '../../../../core/regex.service';
import {VehicleMetadata} from '../../model/vehicle.metadata.model';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class VehicleMetadataService {

  constructor(
    private vehicleStatusService: VehiclestatusService,
    private makeService:MakeService,
    private modelService:ModelService,
    private fuelTypeService:FueltypeService,
    private busTypeService:BustypeService,
    private conditionRateService:ConditionRateService,
    private branchService:BranchService,
    private regexService:RegexService,
  ) {}

  loadAll(): Observable<VehicleMetadata> {
    return forkJoin({
      vehicleStatuses: this.vehicleStatusService.get().pipe(map(r => r.data)),
      makes:this.makeService.get().pipe(map(r => r.data)),
      models:this.modelService.get().pipe(map(r => r.data)),
      fuelTypes:this.fuelTypeService.get().pipe(map(r => r.data)),
      busTypes:this.busTypeService.get().pipe(map(r => r.data)),
      conditionRates:this.conditionRateService.get().pipe(map(r => r.data)),
      branches:this.branchService.getSummary().pipe(map(r => r.data)),
      regexRules:this.regexService.getStaticRegexes('vehicles').pipe(map(r => r.data)),
    });
  }
}
