import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {BranchFacadeService} from '../services/util/branchfacade.service';
import {
  async,
  debounceTime,
  Observable,
  Subject,
  take,
  takeUntil
} from 'rxjs';
import {Branch} from '../entity/branch';
import {ButtonClickEvent, ButtonPanelComponent } from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {DialogService} from '../../../core/dialog.service';
import {MatButton} from '@angular/material/button';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {MatDivider} from '@angular/material/divider';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  BRANCH_DATA_EXPORT_META,
  BRANCH_FILTER_FORM_META, BRANCH_IMMUTABLE_CONTROLLERS_META,
  BRANCH_MAIN_FORM_META,
  BRANCH_TABLE_META
} from '../model/branch.meta';
import {BranchMetadata} from '../model/branch.metadata.model';
import {BranchFormService} from '../services/util/branchform.service';
import {BranchMetadataService} from '../services/util/branch.metadata.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {NgxPermissionsModule} from 'ngx-permissions';
import {BaseComponent} from '../../../shared/base/base.component';
import {Employee} from '../../employeemodule/entity/employee';
import {EmployeeMetadata} from '../../employeemodule/model/employee.metadata.model';
import {EmployeeFacadeService} from '../../employeemodule/services/util/employeefacade.service';
import {EmployeeFormService} from '../../employeemodule/services/util/employeefrom.service';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonPanelComponent,
    NgForOf,
    DynamicFieldComponent,
    NgIf,
    DataTableComponent,
    TableCellDirective,
    MatButton,
    SideViewComponent,
    MatDivider,
    DatePipe,
    NgClass,
    MatIcon,
    FormsModule,
    AsyncPipe,
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatCardTitle,
    NgxPermissionsModule
  ],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
  providers: [
    BranchFacadeService,
    BranchFormService,
    BranchMetadataService,
  ],
})
export class BranchComponent extends BaseComponent<Branch, BranchMetadata>  {

  // ===== Static config =====
  protected override readonly tableColumns    = BRANCH_TABLE_META;
  protected override readonly filterFormMeta  = BRANCH_FILTER_FORM_META;
  protected override readonly mainFormMeta    = BRANCH_MAIN_FORM_META;
  protected override readonly immutableControllers = BRANCH_IMMUTABLE_CONTROLLERS_META
  protected override readonly exportMeta      = BRANCH_DATA_EXPORT_META;
  protected override readonly actionPanelConfig = buildActionPanel({
    permissionMap: {
      create: 'branch-add',
      'bulk-deactivate': 'branch-delete'
    }
  });

  protected override readonly moduleName = 'Branch';
  protected override readonly excelFileName = 'branch.xlsx';

  // ===== Subclass services resolution =====
  protected override facade = inject(BranchFacadeService);
  protected override formService = inject(BranchFormService);

  // ===== Template-accessible streams mapping =====
  protected readonly branches$ = this.facade.branches$;
  protected readonly metadata$  = this.facade.metadata$;
  protected readonly loading$   = this.facade.loading$;
  protected readonly error$     = this.facade.error$;

  // ===== Overridden hooks =====
  protected override getDeactivateConfirmationMessage(): string {
    return 'Only resigned employees will be deactivated. Are you sure?';
  }

}

