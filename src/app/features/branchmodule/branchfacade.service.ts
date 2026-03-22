import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {BranchTypeService} from './services/branchtype.service';
import {BranchStatusService} from './services/branchstatus.service';
import {RegexService} from '../../core/regex.service';
import {BranchType} from './model/branchtype';
import {BranchStatus} from './model/branchstatus';
import {Regex} from '../../shared/models/regex.model';
import {Branch} from './model/branch';
import {BranchService} from './services/branch.service';
import {normalizeSearchCriteria} from '../../core/search-criteria-normalizer';
import {RegionalOfficeService} from './services/regionaloffice.service';
import {RegionalOffice} from './model/regionaloffice';
import {NumberService} from '../../core/number.service';

@Injectable({
  providedIn: 'root',
})export class BranchFacadeService {

  constructor(
    private branchTypeService: BranchTypeService,
    private branchStatusService: BranchStatusService,
    private branchService: BranchService,
    private regionalOfficeService: RegionalOfficeService,
    private regexService: RegexService,
    private numberService:NumberService
  ) {}

  // Load data
  loadBranchTypes(): Observable<BranchType[]> {
    return this.branchTypeService.get().pipe(map(res => res.data));
  }

  loadBranchStatuses(): Observable<BranchStatus[]> {
    return this.branchStatusService.get().pipe(map(res => res.data));
  }

  loadRegionalOffices():Observable<RegionalOffice[]>{
    return this.regionalOfficeService.get().pipe(map(res=>res.data));
  }

  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('branches').pipe(map(res => res.data));
  }

  loadBranches(): Observable<Branch[]> {
    return this.getBranches();
  }

  searchBranches(criteria: Record<string, any>): Observable<Branch[]> {
    const normalized = normalizeSearchCriteria(criteria);
    return this.getBranches(normalized);
  }

  createBranch(branchData: any): Observable<Branch> {
    const status = branchData.branchstatus?.name?.toLowerCase();
    if (status === 'active') {
      return this.branchService.save(branchData);
    }
    return throwError(() => new Error('Branch should be active'));
  }

  updateBranch(branchData: any): Observable<Branch> {
    return this.branchService.update(branchData);
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

  generateEmail(branchCode: string): string | null {
    if (!branchCode) return null;

    const clearCode = branchCode.trim().toLowerCase().replace(/\s+/g, '.').substring(0,3); // handle spaces

    return `${clearCode}@sltb.lk`;
  }

  loadBranchCode(branchName:string): Observable<string> {
    return this.numberService.getGeneratedBranchCode(branchName).pipe(map(res => res.data));
  }


}
