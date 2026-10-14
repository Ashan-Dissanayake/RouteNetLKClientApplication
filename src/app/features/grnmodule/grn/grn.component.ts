import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  GRN_DATA_EXPORT_META,
  GRN_FILTER_FORM_META,
  GRN_MAIN_FORM_META,
  GRN_TABLE_META
} from '../model/grn.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {Grn} from '../entity/grn';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../shared/services/dialog.service';
import {FormbuilderService} from '../../../shared/services/formbuilder.service';
import {GrnFacadeService} from '../service/util/grnfacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatChip} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {GrnMetadata} from '../model/grn.metadata.model';
import {GrnFormService} from '../service/util/grnform.service';
import {GrnMetadataService} from '../service/util/grn.metadata.service';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

const NON_EDITABLE_STATUSES = ['received', 'partially received'];

@Component({
  selector: 'app-grn',
  imports: [
    AsyncPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
    NgIf,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    DataTableComponent,
    MatChip,
    MatDivider,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass
  ],
  templateUrl: './grn.component.html',
  styleUrl: './grn.component.scss',
  standalone:true,
  providers: [
    GrnFacadeService,
    GrnFormService,
    GrnMetadataService,
  ],
})

export class GrnComponent extends BaseComponent<Grn, GrnMetadata> {
  // ===== Static config =====
  protected override readonly config: CrudPageConfig = {
    tableColumns: GRN_TABLE_META,

    filterFormMeta:
    GRN_FILTER_FORM_META,

    mainFormMeta:
    GRN_MAIN_FORM_META,

    exportMeta:
    GRN_DATA_EXPORT_META,

    actionPanel: buildActionPanel({
      exclude: [
        'create',
        'bulk-deactivate'
      ]
    }),

    moduleName: 'GRN',

    excelFileName: 'grn.xlsx',
  };

  protected override facade = inject(GrnFacadeService);
  protected override formService = inject(GrnFormService);

  // ===== Edit =====
  protected override openEditForm(
    row: Grn
  ): void {

    const status =
      row.grnstatus?.name?.toLowerCase() ?? '';

    if (NON_EDITABLE_STATUSES.includes(status)) {

      this.dialog.showMessage({
        heading: 'Edit not allowed',
        message:
          'Cannot edit a GRN that has already been Received or Partially Received.',
      });

      return;
    }

    super.openEditForm(row);
  }
}
