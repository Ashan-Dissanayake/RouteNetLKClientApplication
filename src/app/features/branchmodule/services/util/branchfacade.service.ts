import {Injectable} from '@angular/core';
import {BranchService} from '../api/branch.service';
import {BranchMetadataService} from './branch.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';
import {Branch} from '../../entity/branch';
import {BranchMetadata, EMPTY_BRANCH_METADATA} from '../../model/branch.metadata.model';
import {NumberService} from '../../../../core/number.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class BranchFacadeService extends BaseFacade<Branch, BranchMetadata> {

  constructor(
    private branchService: BranchService,
    private numberService: NumberService,
    private branchMetadataService: BranchMetadataService,
  ) {
    super(
      branchService,
      branchMetadataService,
      EMPTY_BRANCH_METADATA,
    );
  }

  // ===== Domain CRUD validation and custom logic =====

  protected override getDeactivationIds(branches: Branch[]): number[] {
    return branches
      .filter(b => (b.branchstatus?.name ?? '').toLowerCase() === 'closed')
      .map(b => b.id)
      .filter((id): id is number => id != null);
  }

  protected override getNoQualifyingDeactivateErrorMessage(): string {
    return 'Selected branches cannot be deactivated because none are closed.';
  }

  // ===== Domain specific helpers =====

  loadBranchCode(branchName: string): Observable<string> {
    return this.numberService.getGeneratedBranchCode(branchName).pipe(
      map(res => res.data),
    );
  }

  generateEmail(branchCode: string): string | null {
    if (!branchCode) return null;

    const clean = branchCode
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '.')
      .substring(0, 3);

    return `${clean}@sltb.lk`;
  }
}
