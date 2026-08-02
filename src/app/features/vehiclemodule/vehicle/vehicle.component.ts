import {Component, inject} from '@angular/core';
import {
  VEHICLE_DATA_EXPORT_META,
  VEHICLE_FILTER_FORM_META, VEHICLE_IMMUTABLE_CONTROLLERS_META, VEHICLE_MAIN_FORM_META,
  VEHICLE_TABLE_META
} from '../model/vehicle.meta';
import {Vehicle} from '../entity/vehicle';
import {VehicleFacadeService} from '../service/util/vehiclefacade.service';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatButton} from '@angular/material/button';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {VehicleMetadata} from '../model/vehicle.metadata.model';
import {VehicleFormService} from '../service/util/vehicleform.service';
import {VehicleMetadataService} from '../service/util/vehicle.metadata.service';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {BaseComponent} from '../../../shared/base/base.component';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  standalone: true,
  imports: [
    DataTableComponent,
    MatButton,
    MatIcon,
    TableCellDirective,
    SideViewComponent,
    NgClass,
    MatDivider,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
  ],
  styleUrl: './vehicle.component.scss',
  providers: [
    VehicleFacadeService,
    VehicleFormService,
    VehicleMetadataService,
  ],
})
export class VehicleComponent extends BaseComponent<Vehicle, VehicleMetadata> {

  protected override readonly tableColumns = VEHICLE_TABLE_META;
  protected override readonly filterFormMeta = VEHICLE_FILTER_FORM_META;
  protected override readonly mainFormMeta = VEHICLE_MAIN_FORM_META;
  protected override readonly immutableControllers = VEHICLE_IMMUTABLE_CONTROLLERS_META;
  protected override readonly exportMeta = VEHICLE_DATA_EXPORT_META;

  protected override readonly actionPanelConfig = buildActionPanel();

  protected override readonly moduleName = 'Vehicle';
  protected override readonly excelFileName = 'vehicles.xlsx';

  protected override facade = inject(VehicleFacadeService);
  protected override formService = inject(VehicleFormService);

  protected readonly vehicles$ = this.facade.vehicles$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;


  protected override getCustomRowActions(row: Vehicle): Record<string, () => void> {
    return {
      edit: () => this.openEditForm(row)
    };
  }

  protected override getDeactivateConfirmationMessage(): string {
    return 'Only vehicles with status Out of Service or Decommissioned will be deactivated. Are you sure?';
  }

}
