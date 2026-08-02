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
import {BaseComponent} from '../../../shared/base/base.component';

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
    MatIcon,
    NgClass,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './incidentreport.component.html',
  styleUrl: './incidentreport.component.scss',
  standalone:true,
  providers: [
    IncidentFacadeService,
    IncidentFormService,
    IncidentMetadataService,
  ],
})
export class IncidentReportComponent extends BaseComponent<Incident, IncidentMetadata> {

  // ===== Static config =====
  protected override readonly tableColumns = INCIDENT_TABLE_META;
  protected override readonly filterFormMeta = INCIDENT_FILTER_FORM_META;
  protected override readonly mainFormMeta = INCIDENT_MAIN_FORM_META;
  protected override readonly exportMeta = INCIDENT_DATA_EXPORT_META;
  protected override readonly actionPanelConfig =
    buildActionPanel({
      permissionMap: {
        create: 'incident-add'
      }
    });

  protected override readonly moduleName = 'Incident';
  protected override readonly excelFileName = 'incidents.xlsx';

  // ===== Subclass services =====
  protected override facade = inject(IncidentFacadeService);
  protected override formService = inject(IncidentFormService);

  // ===== Template streams mapping =====
  protected readonly incidents$ = this.facade.incidents$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;


  // ===== Override domain actions =====
  protected override getCustomRowActions(row: Incident): Record<string, () => void> {
    return {
      inProgress: () =>
        this.executeDomainAction(
          this.facade.inProgress(row),
          'Incident set to in progress.',
          row
        ),

      vehicleRecovery: () =>
        this.executeDomainAction(
          this.facade.vehicleRecovery(row),
          'Vehicle recovery initiated.',
          row
        ),

      pendingAllocation: () =>
        this.executeDomainAction(
          this.facade.pendingAllocation(row),
          'Incident pending allocation.',
          row
        ),

      resolved: () =>
        this.executeDomainAction(
          this.facade.resolved(row),
          'Incident resolved.',
          row
        ),

      closed: () =>
        this.executeDomainAction(
          this.facade.closed(row),
          'Incident closed.',
          row
        )
    };
  }

  private executeDomainAction(operation$: Observable<Incident>, successMessage: string, row: Incident): void {
    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.dialog.showSuccess(successMessage),
        error: err => this.dialog.showErrorMessage('Failed to update incident', err),
        complete: () => {
          this.facade.reload();
          if (this.activeRow?.id === row.id) this.activeRow = null;
        }
      });
  }

}
