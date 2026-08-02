import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META, INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META,
  INCIDENT_VEHICLE_ALLOCATION_TABLE_META
} from '../model/incidentvehicleallocation.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {Observable,takeUntil} from 'rxjs';
import {IncidentVehicleAllocation} from '../entity/incidentvehicleallocation';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IncidentVehicleAllocationFacadeService} from '../service/util/incidentvehicleallocationfacade.service';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {IncidentVehicleAllocationMetadata} from '../model/incidentvehicleallocation.metadata.model';
import {IncidentVehicleAllocationFormService} from '../service/util/incidentvehicleallocationform.service';
import {IncidentVehicleAllocationMetadataService} from '../service/util/incidentvehicleallocation.metadata.service';
import {BaseComponent} from '../../../shared/base/base.component';

@Component({
  selector: 'app-incidentvehicleallocation',
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
    MatIconButton,
    MatMenu,
    MatMenuItem,
    TableCellDirective,
    MatMenuTrigger,
    MatIcon,
  ],
  templateUrl: './incidentvehicleallocation.component.html',
  styleUrl: './incidentvehicleallocation.component.scss',
  standalone:true,
  providers: [
    IncidentVehicleAllocationFacadeService,
    IncidentVehicleAllocationFormService,
    IncidentVehicleAllocationMetadataService,
  ],
})
export class IncidentVehicleAllocationComponent extends BaseComponent<IncidentVehicleAllocation, IncidentVehicleAllocationMetadata> {

  protected override readonly tableColumns = INCIDENT_VEHICLE_ALLOCATION_TABLE_META;
  protected override readonly filterFormMeta = INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META;
  protected override readonly mainFormMeta = INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META;
  protected override readonly exportMeta = [];
  protected override readonly actionPanelConfig =
    buildActionPanel({ exclude: ['export'] });

  protected override readonly moduleName = 'Incident Vehicle Allocation';
  protected override readonly excelFileName = "";

  protected override facade = inject(IncidentVehicleAllocationFacadeService);
  protected override formService = inject(IncidentVehicleAllocationFormService);

  protected readonly incidentVehicleAllocations$ = this.facade.incidentVehicleAllocations$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  protected override getCustomRowActions(row: IncidentVehicleAllocation): Record<string, () => void> {
    return {
      inProgress: () =>
        this.executeTransition(
          this.facade.inProgress(row),
          'Allocation set to in progress.',
          row
        ),

      pendingAllocation: () =>
        this.executeTransition(
          this.facade.pendingAllocation(row),
          'Allocation set to pending.',
          row
        ),

      released: () =>
        this.executeTransition(
          this.facade.released(row),
          'Allocation released.',
          row
        )
    };
  }


  private executeTransition(operation$: Observable<IncidentVehicleAllocation>, successMessage: string, row: IncidentVehicleAllocation): void {
    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.dialog.showSuccess(successMessage),
        error: err => this.dialog.showErrorMessage('Failed to update allocation', err),
        complete: () => {
          this.facade.reload();
          if (this.activeRow?.id === row.id) {
            this.activeRow = null;
          }
        }
      });
  }


}
