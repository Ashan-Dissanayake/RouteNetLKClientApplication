import {Injectable, OnDestroy} from '@angular/core';
import {BranchMetadata, EMPTY_BRANCH_METADATA} from '../../model/branch.metadata.model';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {BaseFacade} from '../../../../applicationframework/base.facade';
import {Branch} from '../../entity/branch';
import {BranchService} from '../api/branch.service';
import {NumberService} from '../../../../core/number.service';
import {BranchMetadataService} from './branch.metadata.service';
import {debounceTime, filter, Observable, Subject, switchMap, takeUntil} from 'rxjs';
import {CrudFormService} from '../../../../applicationframework/crudform.service';
import {FormbuilderService} from '../../../../shared/services/formbuilder.service';
import {BranchFacadeService} from './branchfacade.service';
import {FormGroup} from '@angular/forms';
import {BRANCH_FILTER_FORM_META, BRANCH_MAIN_FORM_META} from '../../model/branch.meta';

@Injectable()
class BranchFormService implements CrudFormService<Branch, BranchMetadata> , OnDestroy {

  private destroy$ = new Subject<void>();
  private lastGeneratedName: string | null = null;

  constructor(
    private formBuilder: FormbuilderService,
    private facade: BranchFacadeService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter Form =====

  buildFilterForm(metadata: BranchMetadata): FormGroup {
    return this.formBuilder.build(
      [...BRANCH_FILTER_FORM_META],
      {
        ssbranchstatus: metadata.branchStatuses,
      }
    );
  }

  // ===== Main Form =====

  buildMainForm(metadata: BranchMetadata): FormGroup {
    const form = this.formBuilder.build(
      [...BRANCH_MAIN_FORM_META],
      {
        branchtype: metadata.branchTypes,
        regionaloffice: metadata.regionalOffices,
        branchstatus: metadata.branchStatuses,
        regexes: metadata.regexes,
      }
    );

    this.wireAutoGenerate(form);

    return form;
  }

  // ===== Branch-specific Behaviour =====

  private wireAutoGenerate(form: FormGroup): void {
    const nameControl = form.get('name');

    if (!nameControl) {
      return;
    }

    nameControl.valueChanges.pipe(debounceTime(500),

      map((name: string) => name?.trim()),
      distinctUntilChanged(),
      filter(() => nameControl.valid),
      filter(() => !form.get('code')?.value),
      filter(name => name !== this.lastGeneratedName),
      switchMap(name =>
        this.facade.loadBranchCode(name)
      ),
      takeUntil(this.destroy$),
    ).subscribe(code => {

      const email = this.facade.generateEmail(code);
      form.patchValue(
        {code, email},
        {emitEvent: false}
      );

      this.lastGeneratedName = nameControl.value;
    });
  }

  // ===== Create Form =====

  initCreateForm(metadata: BranchMetadata): FormGroup {
    const form = this.buildMainForm(metadata);
    form.get('docreated')?.setValue(new Date());
    return form;
  }

}

export default BranchFormService
