import {Injectable} from '@angular/core';
import {EMPTY, Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {BranchtypeService} from './services/branchtype.service';
import {BranchstatusService} from './services/branchstatus.service';
import {RegexService} from '../../core/regex.service';
import {BranchType} from './model/branchtype';
import {BranchStatus} from './model/branchstatus';
import {District} from './model/district';
import {DistrictService} from './services/district.service';
import {Regex} from '../../shared/models/regex.model';
import {Branch} from './model/branch';
import {BranchService} from './services/branch.service';
import {Province} from './model/province';
import {ProvinceService} from './services/province.service';

@Injectable({
  providedIn: 'root',
})export class BranchFacadeService {

  constructor(
    private branchTypeService: BranchtypeService,
    private branchStatusService: BranchstatusService,
    private districtService: DistrictService,
    private branchService: BranchService,
    private provinceService: ProvinceService,
    private regexService: RegexService
  ) {}

  // Load data
  loadBranchTypes(): Observable<BranchType[]> {
    return this.branchTypeService.get().pipe(map(res => res.data));
  }

  loadBranchStatuses(): Observable<BranchStatus[]> {
    return this.branchStatusService.get().pipe(map(res => res.data));
  }

  loadDistricts():Observable<District[]>{
    return this.districtService.get().pipe(map(res=>res.data));
  }

  loadProvinces():Observable<Province[]>{
    return this.provinceService.get().pipe(map(res=>res.data));
  }

  loadRegexes(): Observable<Regex> {
    return this.regexService.getRegexes('branches').pipe(map(res => res.data));
  }

  loadBranches(): Observable<Branch[]> {
    return this.getBranches();
  }

  searchBranches(criteria: any): Observable<Branch[]> {
    const normalized = this.normalizeSearchCriteria(criteria);
    return this.getBranches(normalized);
  }

  createBranch(branchData: any): Observable<Branch> {
    const branch = this.normalizeBranchData(branchData);
    const status = branch.branchstatus?.name?.toLowerCase();
    if (status === 'active') {
      return this.branchService.save(branch);
    }
    return throwError(() => new Error('Branch should be active'));
  }

  updateBranch(branchData: any): Observable<Branch> {
    const branch = this.normalizeBranchData(branchData);
    return this.branchService.update(branch);
  }

  deleteBranches(branches: Branch[]): Observable<number[]> {
    if (!branches || branches.length === 0) {
      return throwError(() => new Error('No branches selected'));
    }
    // Collect only closed branch IDs
    const branchIds = branches
      .filter(b => (b.branchstatus?.name ?? '').toLowerCase() === 'closed')
      .map(b => b.id)
      .filter(id => id != null);
    if (branchIds.length === 0) {
      return throwError(() => new Error('Selected branches cannot be deactivated because they are not closed'));
    }
    return this.branchService.deactivate(branchIds);
  }


  // Private helpers
  private getBranches(params?: any): Observable<Branch[]> {
    return this.branchService.get(params).pipe(map(res => res.data));
  }

  private normalizeSearchCriteria(criteria: any): any {
    return Object.fromEntries(
      Object.entries(criteria).map(([key, value]) => {
        if (typeof value === 'string') return [key, value.trim().toLowerCase()];
        if (value && typeof value === 'object' && 'id' in value) return [key, value.id];
        return [key, value];
      })
    );
  }

  private normalizeBranchData(branchData: any): any {
    const normalized = { ...branchData };
    normalized.branchcoverages = (normalized.branchcoverages || []).map((coverage: any) => ({
      district: coverage.district
        ? { id: coverage.district.id, name: coverage.district.name }
        : { id: coverage.id, name: coverage.name }
    }));
    return normalized;
  }

}
