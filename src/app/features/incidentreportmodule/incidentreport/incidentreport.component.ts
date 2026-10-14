import {Component, inject} from '@angular/core';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  INCIDENT_DATA_EXPORT_META,
  INCIDENT_FILTER_FORM_META,
  INCIDENT_MAIN_FORM_META,
  INCIDENT_TABLE_META
} from '../model/incident.meta';
import {Observable,takeUntil} from 'rxjs';
import {Incident} from '../entity/incident';
import { ReactiveFormsModule} from '@angular/forms';
import {IncidentFacadeService} from '../service/util/incidentfacade.service';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatProgressBar} from '@angular/material/progress-bar';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {IncidentMetadata} from '../model/incidentreport.metadata.model';
import {IncidentFormService} from '../service/util/incidentform.service';
import {IncidentMetadataService} from '../service/util/incident.metadata.service';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

@Component({
  selector: 'app-incidentreport',
  imports: [
    AsyncPipe,
    ButtonPanelComponent,
    DataTableComponent,
    DynamicFieldComponent,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatDivider,
    MatIcon,
    MatProgressBar,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SideViewComponent,
    TableCellDirective,
    NgClass,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './incidentreport.component.html',
  styleUrl: './incidentreport.component.scss',
  standalone: true,
  providers: [
    IncidentFacadeService,
    IncidentFormService,
    IncidentMetadataService,
  ],
})
export class IncidentReportComponent extends BaseComponent<Incident, IncidentMetadata> {

  protected override readonly config: CrudPageConfig = {
    tableColumns: INCIDENT_TABLE_META,
    filterFormMeta: INCIDENT_FILTER_FORM_META,
    mainFormMeta: INCIDENT_MAIN_FORM_META,
    exportMeta: INCIDENT_DATA_EXPORT_META,
    actionPanel: buildActionPanel({
      permissionMap: {
        create: 'incident-add',
      },
    }),
    moduleName: 'Incident',
    excelFileName: 'incidents.xlsx',
  };

  protected override facade =
    inject(IncidentFacadeService);

  protected override formService =
    inject(IncidentFormService);

  protected override onRowAction(
    action: string,
    row: Incident
  ): void {

    const transitions: Record<
      string,
      () => Observable<Incident>
    > = {
      inProgress: () =>
        this.facade.inProgress(row),

      vehicleRecovery: () =>
        this.facade.vehicleRecovery(row),

      pendingAllocation: () =>
        this.facade.pendingAllocation(row),

      resolved: () =>
        this.facade.resolved(row),

      closed: () =>
        this.facade.closed(row),
    };

    const operation = transitions[action];

    if (operation) {
      this.executeDomainAction(
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
      inProgress: 'Incident set to in progress.',
      vehicleRecovery: 'Vehicle recovery initiated.',
      pendingAllocation: 'Incident pending allocation.',
      resolved: 'Incident resolved.',
      closed: 'Incident closed.',
    };

    return messages[action] ?? 'Incident updated successfully.';
  }

  private executeDomainAction(
    operation$: Observable<Incident>,
    successMessage: string,
    row: Incident
  ): void {

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () =>
          this.dialog.showSuccess(successMessage),

        error: err =>
          this.dialog.showErrorMessage(
            'Failed to update incident',
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
