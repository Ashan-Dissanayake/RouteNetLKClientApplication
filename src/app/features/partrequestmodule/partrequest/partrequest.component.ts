import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  PART_REQUEST_DATA_EXPORT_META,
  PART_REQUEST_FILTER_FORM_META,
  PART_REQUEST_MAIN_FORM_META,
  PART_REQUEST_TABLE_META
} from '../model/partrequest.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {async, debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {PartRequest} from '../entity/partrequest';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DialogService} from '../../../shared/services/dialog.service';
import {FormbuilderService} from '../../../shared/services/formbuilder.service';
import {PartRequestFacadeService} from '../service/util/partrequestfacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatProgressBar} from '@angular/material/progress-bar';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {MatChip} from '@angular/material/chips';
import {MatTooltip} from '@angular/material/tooltip';
import {PartRequestMetadata} from '../model/partrequest.metadata.model';
import {PartRequestFormService} from '../service/util/partrequestform.service';
import {PartRequestMetadataService} from '../service/util/partrequest.metadata.service';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

@Component({
  selector: 'app-partrequest',
  imports: [
    AsyncPipe,
    ButtonPanelComponent,
    DataTableComponent,
    DynamicFieldComponent,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatDivider,
    MatIcon,
    MatProgressBar,
    NgForOf,
    NgIf,
    SideViewComponent,
    TableCellDirective,
    ReactiveFormsModule,
    NgClass,
    MatChip,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './partrequest.component.html',
  styleUrl: './partrequest.component.scss',
  standalone: true,
  providers: [
    PartRequestFacadeService,
    PartRequestFormService,
    PartRequestMetadataService,
  ],
})
export class PartRequestComponent extends BaseComponent<PartRequest, PartRequestMetadata> {

  protected override readonly config: CrudPageConfig = {
    tableColumns: PART_REQUEST_TABLE_META,
    filterFormMeta: PART_REQUEST_FILTER_FORM_META,
    mainFormMeta: PART_REQUEST_MAIN_FORM_META,
    exportMeta: PART_REQUEST_DATA_EXPORT_META,

    actionPanel: buildActionPanel(),

    moduleName: 'Part Request',
    excelFileName: 'part-requests.xlsx',
  };

  protected override facade = inject(PartRequestFacadeService);
  protected override formService = inject(PartRequestFormService);

  protected override onRowAction(
    action: string,
    row: PartRequest
  ): void {

    const transitions: Record<
      string,
      () => Observable<PartRequest>
    > = {
      approved: () =>
        this.facade.approve(row),

      rejected: () =>
        this.facade.reject(row),
    };

    const operation = transitions[action];

    if (!operation) {
      this.dialog.showWarning(
        `Unknown row action: ${action}`
      );
      return;
    }

    operation()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const message =
            action === 'approved'
              ? 'Part request approved successfully.'
              : 'Part request rejected successfully.';

          this.dialog.showSuccess(message);
        },

        error: err =>
          this.dialog.showMessage({
            heading: 'Failed to execute',
            message: err.errorMessage,
          }),

        complete: () => {
          this.facade.reload();

          if (this.activeRow?.id === row.id) {
            this.activeRow = null;
          }
        },
      });
  }
}
