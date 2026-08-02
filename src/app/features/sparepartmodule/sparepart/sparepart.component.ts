import {Component, inject} from '@angular/core';
import { PART_DATA_EXPORT_META, PART_FILTER_FORM_META, PART_IMMUTABLE_CONTROLLERS_META, PART_MAIN_FORM_META, PART_TABLE_META } from '../model/part.meta';
import { buildActionPanel } from '../../../shared/component/button/action-panel.factory';
import {takeUntil} from 'rxjs';
import { Part } from '../entity/part';
import { ReactiveFormsModule} from '@angular/forms';
import { SparePartFacadeService } from '../service/util/sparepartfacade.service';
import { DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {  ButtonPanelComponent } from '../../../shared/component/button/button-panel/button-panel.component';
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatCard, MatCardTitle, MatCardContent } from "@angular/material/card";
import { DynamicFieldComponent } from "../../../shared/component/form/dynamic-field.component";
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {PartMetadata} from '../model/sparepart.metadata.model';
import {PartFormService} from '../service/util/sparepartform.service';
import {PartMetadataService} from '../service/util/sparepart.metadata.service';
import {BaseComponent} from '../../../shared/base/base.component';

@Component({
  selector: 'app-sparepart',
  imports: [
    MatProgressBar,
    MatCard,
    MatCardTitle,
    MatCardContent,
    ButtonPanelComponent,
    DynamicFieldComponent,
    ReactiveFormsModule,
    NgIf,
    MatButton,
    AsyncPipe,
    NgForOf,
    DataTableComponent,
    MatDivider,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    NgClass,
  ],
  templateUrl: './sparepart.component.html',
  styleUrl: './sparepart.component.scss',
  standalone: true,
  providers: [
    SparePartFacadeService,
    PartFormService,
    PartMetadataService,
  ],
})
export class SparePartComponent extends BaseComponent<Part, PartMetadata> {

  protected override readonly tableColumns = PART_TABLE_META;
  protected override readonly filterFormMeta = PART_FILTER_FORM_META;
  protected override readonly mainFormMeta = PART_MAIN_FORM_META;
  protected override readonly immutableControllers = PART_IMMUTABLE_CONTROLLERS_META;
  protected override readonly exportMeta = PART_DATA_EXPORT_META;

  protected override readonly actionPanelConfig = buildActionPanel();

  protected override readonly moduleName = 'Spare Part';
  protected override readonly excelFileName = 'spare-parts.xlsx';

  protected override facade = inject(SparePartFacadeService);
  protected override formService = inject(PartFormService);

  protected readonly parts$ = this.facade.items$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  protected override getCustomRowActions(row: Part): Record<string, () => void> {
    return {
      edit: () =>
        this.openEditForm(row)
    };
  }


  protected override getCustomActionPanelHandlers() {
    return {
      'bulk-deactivate': () =>
        this.deactivateSelected()
    };
  }

  protected override deactivateSelected(): void {
    if(this.selectedRows.size === 0){
      this.dialog.showWarning(
        'Please select at least one record to deactivate.'
      );
      return;
    }

    this.dialog.showConfirmation({
      heading: 'Deactivate Parts',
      message: 'Selected parts will be deactivated. Are you sure?'

    })
      .subscribe(confirmed => {
        if(!confirmed) return;
        this.facade
          .deactivate(Array.from(this.selectedRows))
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => this.dialog.showSuccess('Selected parts deactivated successfully.'),
            error: err => this.dialog.showErrorMessage('Failed to deactivate', err),
            complete: () => {
              this.selectedRows.clear();
              this.selectedCount = 0;
              this.facade.reload();
            }
          });
      });
  }

}
