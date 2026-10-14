import {Component, inject} from '@angular/core';
import {VehicleServiceFacadeService} from '../service/util/vehicleservicefacade.service';
import {VehicleServiceFormService} from '../service/util/vehicleservicefrom.service';
import {VehicleServiceMetadataService} from '../service/util/vehicleservice.metadat.service';
import {
  VEHICLE_SERVICE_DATA_EXPORT_META,
  VEHICLE_SERVICE_FILTER_FORM_META,
  VEHICLE_SERVICE_MAIN_FORM_META,
  VEHICLE_SERVICE_TABLE_META
} from '../model/vehicleservice.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {Observable, takeUntil} from 'rxjs';
import {VehicleService} from '../entity/vehicleservice';
import {VehicleServiceMetadata} from '../model/vehicleservice.metadata.model';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

@Component({
  selector: 'app-vehicleservice',
  imports: [
    AsyncPipe,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatProgressBar,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    DataTableComponent,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    SideViewComponent,
    TableCellDirective,
    MatMenuTrigger,
    NgClass
  ],
  templateUrl: './vehicleservice.component.html',
  styleUrl: './vehicleservice.component.scss',
  standalone: true,
  providers: [
    VehicleServiceFacadeService,
    VehicleServiceFormService,
    VehicleServiceMetadataService
  ]
})
export class VehicleServiceComponent extends BaseComponent<VehicleService, VehicleServiceMetadata>{

  // ===== Static config =====
  protected override readonly config: CrudPageConfig = {
    tableColumns: VEHICLE_SERVICE_TABLE_META,
    filterFormMeta: VEHICLE_SERVICE_FILTER_FORM_META,
    mainFormMeta: VEHICLE_SERVICE_MAIN_FORM_META,
    exportMeta: VEHICLE_SERVICE_DATA_EXPORT_META,

    actionPanel: buildActionPanel({
      exclude: ['bulk-deactivate']
    }),

    moduleName: 'Vehicle Service',
    excelFileName: 'vehicle-service.xlsx',
  };

  // ===== Subclass services resolution =====
  protected override facade = inject(VehicleServiceFacadeService);
  protected override formService = inject(VehicleServiceFormService);

  // ===== Status transitions =====
  protected changeStatus(status: string): void {
    if (!this.activeRow) return;

    const id = this.activeRow.id;
    const statusKey = status.toLowerCase();

    const transitions: Record<
      string,
      () => Observable<VehicleService>
    > = {
      'execute': () => this.facade.startExecution(id),
      'parts-on-hold': () => this.facade.placeOnHold(id),
      'completed': () => this.facade.complete(id),
    };

    const transition = transitions[statusKey];

    if (!transition) {
      this.dialog.showWarning(`Unknown status: ${status}`);
      return;
    }

    this.executeTransition(transition());
  }

  private executeTransition(operation$: Observable<any>): void {
    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialog.showSuccess('Status updated successfully.'),
      error: err => this.dialog.showMessage({
        heading: 'Failed to update status',
        message: err.errorMessage,
      }),
      complete: () => {
        this.facade.reload();
        this.activeRow = null;
      },
    });
  }

}
