import {Injectable} from '@angular/core';
import {debounceTime, distinctUntilChanged, filter, Subject, switchMap, takeUntil} from 'rxjs';
import {FormbuilderService} from '../../../../core/formbuilder.service';
import {FormGroup} from '@angular/forms';
import {BranchMetadata} from '../../model/branch.metadata.model';
import {BRANCH_FILTER_FORM_META, BRANCH_MAIN_FORM_META} from '../../model/branch.meta';
import {BranchFacadeService} from './branchfacade.service';
import {map} from 'rxjs/operators';

@Injectable()
export class BranchFormService {

  private destroy$ = new Subject<void>();
  private lastGeneratedName: string | null = null;

  constructor(
    private formBuilder: FormbuilderService,
    private facade:      BranchFacadeService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Filter form =====
  buildFilterForm(metadata: BranchMetadata): FormGroup {
    return this.formBuilder.build([...BRANCH_FILTER_FORM_META], {
      ssbranchstatus: metadata.branchStatuses,
    });
  }

  buildMainForm(metadata: BranchMetadata): FormGroup {
    const form = this.formBuilder.build([...BRANCH_MAIN_FORM_META], {
      branchtype:     metadata.branchTypes,
      regionaloffice: metadata.regionalOffices,
      branchstatus:   metadata.branchStatuses,
      regexes:        metadata.regexes,
    });

    this.wireAutoGenerate(form);
    return form;
  }

  private wireAutoGenerate(form: FormGroup): void {
    const nameControl = form.get('name');
    if (!nameControl) return;

    nameControl.valueChanges.pipe(
      debounceTime(500),
      map((name: string) => name?.trim()),
      distinctUntilChanged(),
      filter(() => nameControl.valid),
      filter(() => !form.get('code')?.value),
      filter(name => name !== this.lastGeneratedName),
      switchMap(name => this.facade.loadBranchCode(name)),
      takeUntil(this.destroy$),
    ).subscribe(code => {
      const email = this.facade.generateEmail(code);

      // emitEvent: false prevents these setValue calls from
      // triggering valueChanges and causing a second API call
      form.patchValue({ code, email }, { emitEvent: false });

      this.lastGeneratedName = nameControl.value;
    });
  }
}
