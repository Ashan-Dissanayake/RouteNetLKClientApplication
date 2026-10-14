import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BranchFacadeService} from '../services/util/branchfacade.service';
import {Branch} from '../entity/branch';
import {ButtonPanelComponent } from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton} from '@angular/material/button';
import { DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {MatDivider} from '@angular/material/divider';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  BRANCH_DATA_EXPORT_META,
  BRANCH_FILTER_FORM_META, BRANCH_IMMUTABLE_CONTROLLERS_META,
  BRANCH_MAIN_FORM_META,
  BRANCH_TABLE_META
} from '../model/branch.meta';
import {BranchMetadata} from '../model/branch.metadata.model';
import {BranchMetadataService} from '../services/util/branch.metadata.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {NgxPermissionsModule} from 'ngx-permissions';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';
import BranchFormService from '../services/util/branchform.service';

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
  protected override readonly config: CrudPageConfig = {
    tableColumns: BRANCH_TABLE_META,
    filterFormMeta: BRANCH_FILTER_FORM_META,
    mainFormMeta: BRANCH_MAIN_FORM_META,
    immutableControllers: BRANCH_IMMUTABLE_CONTROLLERS_META,
    exportMeta: BRANCH_DATA_EXPORT_META,
    actionPanel: buildActionPanel({
      permissionMap: {
        create: 'branch-add',
        'bulk-deactivate': 'branch-delete'
      }
    }),
    moduleName: 'Branch',
    excelFileName: 'branch.xlsx',
  };

  // ===== Subclass services resolution =====
  protected override facade = inject(BranchFacadeService);
  protected override formService = inject(BranchFormService);

  // ===== Overridden hooks =====
  protected override getDeactivateConfirmationMessage(): string {
    return 'Only resigned employees will be deactivated. Are you sure?';
  }

}

