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
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

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

  protected override readonly config: CrudPageConfig = {
    tableColumns: PART_TABLE_META,
    filterFormMeta: PART_FILTER_FORM_META,
    mainFormMeta: PART_MAIN_FORM_META,
    immutableControllers: PART_IMMUTABLE_CONTROLLERS_META,
    exportMeta: PART_DATA_EXPORT_META,

    actionPanel: buildActionPanel(),

    moduleName: 'Spare Part',
    excelFileName: 'spare-parts.xlsx',
  };

  protected override facade =
    inject(SparePartFacadeService);

  protected override formService =
    inject(PartFormService);

  protected override getDeactivateConfirmationMessage(): string {
    return 'Selected parts will be deactivated. Are you sure?';
  }
}
