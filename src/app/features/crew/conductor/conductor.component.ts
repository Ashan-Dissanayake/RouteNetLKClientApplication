import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  CONDUCTOR_DATA_EXPORT_META,
  CONDUCTOR_FILTER_FORM_META,
  CONDUCTOR_IMMUTABLE_CONTROLLERS_META, CONDUCTOR_MAIN_FORM_META,
  CONDUCTOR_TABLE_META
} from '../model/conductor.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {ReactiveFormsModule} from '@angular/forms';
import {Conductor} from '../entity/conductor';
import {ConductorFacadeService} from '../service/util/conductorfacade.service';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import { ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {ConductorMetadata} from '../model/conductor.metadata.model';
import {ConductorFormService} from '../service/util/conductorformservice';
import {ConductorMetadataService} from '../service/util/conductor.metadata.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {BaseComponent} from '../../../shared/base/base.component';

@Component({
  selector: 'app-conductor',
  standalone:true,
  imports: [
    ButtonPanelComponent,
    DataTableComponent,
    DynamicFieldComponent,
    MatButton,
    MatDivider,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SideViewComponent,
    TableCellDirective,
    MatIcon,
    NgClass,
    AsyncPipe,
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatCardTitle
  ],
  providers: [
    ConductorFacadeService,
    ConductorFormService,
    ConductorMetadataService,
  ],
  templateUrl: './conductor.component.html',
  styleUrl: './conductor.component.scss'
})
export class ConductorComponent extends BaseComponent<Conductor, ConductorMetadata> {

  // ===== Static configuration =====
  protected override readonly tableColumns = CONDUCTOR_TABLE_META;
  protected override readonly filterFormMeta = CONDUCTOR_FILTER_FORM_META;
  protected override readonly mainFormMeta = CONDUCTOR_MAIN_FORM_META;
  protected override readonly exportMeta = CONDUCTOR_DATA_EXPORT_META;
  protected override readonly immutableControllers = CONDUCTOR_IMMUTABLE_CONTROLLERS_META;
  protected override readonly actionPanelConfig =
    buildActionPanel({
      exclude: ['bulk-deactivate']
    });
  protected override readonly moduleName = 'Conductor';
  protected override readonly excelFileName = 'conductors.xlsx';


  // ===== Services =====
  protected override facade = inject(ConductorFacadeService);
  protected override formService = inject(ConductorFormService);

  // ===== Streams =====
  protected readonly conductors$ = this.facade.conductors$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  // ===== Customizations =====
  /**
   * Conductor module does not support bulk deactivation.
   * BaseComponent handles other common actions.
   */

  protected override getCustomRowActions(row: Conductor): Record<string, () => void> {
    return {};
  }

  protected override getCustomActionPanelHandlers(): Record<string, () => void> {
    return {};
  }

  protected override getDeactivateConfirmationMessage(): string {
    return 'Only eligible conductors can be deactivated. Are you sure?';
  }

}
