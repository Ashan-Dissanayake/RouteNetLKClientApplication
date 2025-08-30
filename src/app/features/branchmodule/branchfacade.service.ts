import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {BranchtypeService} from './services/branchtype.service';
import {BranchstatusService} from './services/branchstatus.service';
import {RegexService} from '../../core/regex.service';
import {BranchType} from './model/branchtype';
import {BranchStatus} from './model/branchstatus';
import {District} from './model/district';
import {DistrictService} from './services/district.service';
import {Regex} from '../../shared/models/regex.model';
import {FormGroup} from '@angular/forms';
import {Branch} from './model/branch';

@Injectable({ providedIn: 'root' })
export class BranchFacadeService {

  branch:Branch = new Branch();

  constructor(
    private branchtypeService: BranchtypeService,
    private branchstatusService: BranchstatusService,
    private districtService: DistrictService,
    private regexService: RegexService
  ) {}

  loadBranchTypes(): Observable<BranchType[]> {
    return this.branchtypeService.get().pipe(map(res => res.data));
  }

  loadBranchStatuses(): Observable<BranchStatus[]> {
    return this.branchstatusService.get().pipe(map(res => res.data));
  }

  loadDistricts():Observable<District[]>{
    return this.districtService.get().pipe(map(res=>res.data));
  }

  loadRegexes(): Observable<Regex> {
    return this.regexService.getRegexes('branches').pipe(map(res => res.data));
  }

  createBranch(branchFrom:FormGroup){
      this.branch = branchFrom.getRawValue();
  }

}
