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
import {BaseComponent} from '../../../shared/base/base.component';

@Component({
  selector: 'app-crew',
  standalone:true,
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
    MatCardTitle
  ],
  providers: [
    DriverFacadeService,
    DriverFormService,
    DriverMetadataService,
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss'
})
export class DriverComponent extends BaseComponent<Driver, DriverMetadata> {

  // ===== Static configuration =====
  protected override readonly tableColumns = DRIVER_TABLE_META;
  protected override readonly filterFormMeta = DRIVER_FILTER_FORM_META;
  protected override readonly mainFormMeta = DRIVER_MAIN_FORM_META;
  protected override readonly exportMeta = DRIVER_DATA_EXPORT_META;
  protected override readonly immutableControllers = DRIVER_IMMUTABLE_CONTROLLERS_META;
  protected override readonly actionPanelConfig = buildActionPanel(
    {exclude: ['bulk-deactivate'],}
  );

  protected override readonly moduleName = 'Driver';
  protected override readonly excelFileName = 'drivers.xlsx';

  // ===== Services =====
  protected override readonly facade = inject(DriverFacadeService);
  protected override readonly formService = inject(DriverFormService);

  // ===== Template accessible streams =====
  protected readonly drivers$ = this.facade.drivers$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  // ===== Custom row actions =====
  protected override getCustomRowActions(row: Driver): Record<string, () => void> {
    return {};
  }

  // ===== Custom action panel handlers =====
  protected override getCustomActionPanelHandlers(): Record<string, () => void> {
    return {};
  }


}
