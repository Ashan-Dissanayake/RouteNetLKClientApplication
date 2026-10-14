import {Component, inject} from '@angular/core';
import {Driver} from '../entity/driver';
import { DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatDivider} from '@angular/material/list';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DriverFacadeService} from '../service/util/driverfacade.service';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {  ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {
  DRIVER_DATA_EXPORT_META,
  DRIVER_FILTER_FORM_META, DRIVER_IMMUTABLE_CONTROLLERS_META, DRIVER_MAIN_FORM_META,
  DRIVER_TABLE_META
} from '../model/driver.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {DriverFormService} from '../service/util/driverformservice';
import {DriverMetadataService} from '../service/util/driver.metadata.service';
import {DriverMetadata} from '../model/driver.metadata.model';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

@Component({
  selector: 'app-crew',
  standalone: true,
  imports: [
    DataTableComponent,
    MatButton,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ButtonPanelComponent,
    AsyncPipe,
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatCardTitle,
  ],
  providers: [
    DriverFacadeService,
    DriverFormService,
    DriverMetadataService,
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss',
})
export class DriverComponent extends BaseComponent<Driver, DriverMetadata> {

  protected override readonly config: CrudPageConfig = {
    tableColumns: DRIVER_TABLE_META,
    filterFormMeta: DRIVER_FILTER_FORM_META,
    mainFormMeta: DRIVER_MAIN_FORM_META,
    exportMeta: DRIVER_DATA_EXPORT_META,

    immutableControllers:
    DRIVER_IMMUTABLE_CONTROLLERS_META,

    actionPanel: buildActionPanel({
      permissionMap: {
        create: 'branch-add',
        'bulk-deactivate': 'branch-delete',
      },
    }),

    moduleName: 'Driver',
    excelFileName: 'drivers.xlsx',
  };

  protected override readonly facade =
    inject(DriverFacadeService);

  protected override readonly formService =
    inject(DriverFormService);
}
