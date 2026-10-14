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
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

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
  standalone: true,
  providers: [
    IncidentVehicleAllocationFacadeService,
    IncidentVehicleAllocationFormService,
    IncidentVehicleAllocationMetadataService,
  ],
})
export class IncidentVehicleAllocationComponent extends BaseComponent<IncidentVehicleAllocation, IncidentVehicleAllocationMetadata> {

  protected override readonly config: CrudPageConfig = {
    tableColumns: INCIDENT_VEHICLE_ALLOCATION_TABLE_META,
    filterFormMeta: INCIDENT_VEHICLE_ALLOCATION_FILTER_FORM_META,
    mainFormMeta: INCIDENT_VEHICLE_ALLOCATION_MAIN_FORM_META,
    exportMeta: [],
    actionPanel: buildActionPanel({
      exclude: ['export'],
    }),
    moduleName: 'Incident Vehicle Allocation',
    excelFileName: '',
  };

  protected override facade =
    inject(IncidentVehicleAllocationFacadeService);

  protected override formService =
    inject(IncidentVehicleAllocationFormService);

  protected override onRowAction(
    action: string,
    row: IncidentVehicleAllocation
  ): void {

    const transitions: Record<
      string,
      () => Observable<IncidentVehicleAllocation>
    > = {
      inProgress: () =>
        this.facade.inProgress(row),

      pendingAllocation: () =>
        this.facade.pendingAllocation(row),

      released: () =>
        this.facade.released(row),
    };

    const operation = transitions[action];

    if (operation) {
      this.executeTransition(
        operation(),
        this.getSuccessMessage(action),
        row
      );
      return;
    }

    super.onRowAction(action, row);
  }

  private getSuccessMessage(action: string): string {

    const messages: Record<string, string> = {
      inProgress: 'Allocation set to in progress.',
      pendingAllocation: 'Allocation set to pending.',
      released: 'Allocation released.',
    };

    return messages[action] ?? 'Allocation updated successfully.';
  }

  private executeTransition(
    operation$: Observable<IncidentVehicleAllocation>,
    successMessage: string,
    row: IncidentVehicleAllocation
  ): void {

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () =>
          this.dialog.showSuccess(successMessage),

        error: err =>
          this.dialog.showErrorMessage(
            'Failed to update allocation',
            err
          ),

        complete: () => {
          this.facade.reload();

          if (this.activeRow?.id === row.id) {
            this.activeRow = null;
          }
        },
      });
  }
}
