import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  PERMIT_EXPORT_META,
  PERMIT_FILTER_FORM_META,
  PERMIT_MAIN_FORM_META,
  PERMIT_TABLE_META
} from '../model/permit.meta';
import {PermitFacadeService} from '../service/util/permitfacade.service';
import {takeUntil} from 'rxjs';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {Permit} from '../entity/permit';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {MatDivider} from '@angular/material/divider';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {ReactiveFormsModule} from '@angular/forms';
import {PermitMetadata} from '../model/permit.metadata.model';
import {PermitFormService} from '../service/util/permitfrom.service';
import {PermitMetadataService} from '../service/util/permit.metadata.service';
import {BaseComponent} from '../../../shared/base/base.component';

@Component({
  selector: 'app-permit',
  imports: [
    DataTableComponent,
    MatCardTitle,
    NgIf,
    MatCardContent,
    MatCard,
    MatProgressBar,
    MatButton,
    AsyncPipe,
    TableCellDirective,
    MatIcon,
    SideViewComponent,
    ButtonPanelComponent,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    ReactiveFormsModule,
    NgFor
  ],
  templateUrl: './permit.component.html',
  styleUrl: './permit.component.scss',
  standalone:true,
  providers: [
    PermitFacadeService,
    PermitFormService,
    PermitMetadataService,
  ],
})
export class PermitComponent extends BaseComponent<Permit, PermitMetadata> {

  // ===== Static config =====
  protected override readonly tableColumns = PERMIT_TABLE_META;
  protected override readonly filterFormMeta = PERMIT_FILTER_FORM_META;
  protected override readonly mainFormMeta = PERMIT_MAIN_FORM_META;
  protected override readonly exportMeta = PERMIT_EXPORT_META;
  protected override readonly actionPanelConfig = buildActionPanel();

  protected override readonly moduleName = 'Permit';
  protected override readonly excelFileName = 'permits.xlsx';

  // ===== Services =====
  protected override facade = inject(PermitFacadeService);
  protected override formService = inject(PermitFormService);

  // ===== Streams =====
  protected readonly permits$ = this.facade.permits$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  // ===== Custom actions =====
  protected override getCustomRowActions(row: Permit): Record<string, () => void> {
    return {
      transfer: () => this.transferPermit(row)
    };
  }

  // ===== Domain operation =====
  private transferPermit(row: Permit): void {
    this.dialog.showConfirmation({
      heading: 'Permit Transfer',
      message:
        `Are you sure you want to transfer Permit ${row.number}?`,
    })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.facade.transfer(row.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialog.showSuccess(
                'Permit transferred successfully.'
              );
            },
            error: err => {
              const validationMessage =
                err.friendlyMessage ||
                err.error?.details?.join('\n') ||
                err.message;
              this.dialog.showMessage({
                heading: 'Failed to transfer permit',
                message: validationMessage
              });
            },
            complete: () => {
              this.facade.reload();
            }
          });
      });
  }

}
