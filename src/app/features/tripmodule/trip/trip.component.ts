import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Observable, Subject ,async} from 'rxjs';
import { debounceTime, take, takeUntil, } from 'rxjs/operators';
import {TRIP_DATA_EXPORT_META, TRIP_FILTER_FORM_META, TRIP_MAIN_FORM_META, TRIP_TABLE_META} from '../model/trip.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {Trip} from '../entity/trip';
import {TripLookUpDataModel} from '../model/trip.lookupdata.model';
import {TripFacadeService} from '../service/util/tripfacade.service';
import {TripFormService} from '../service/util/tripfrom.service';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {TripLookupDataService} from '../service/util/trip.lookupdata.service';
import {exportToExcel} from '../../../shared/component/export/excel-export.util';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {BaseComponent} from '../../../shared/base/base.component';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, NgForOf, NgIf, NgClass, DatePipe,
    MatButton, MatDivider, MatIcon,
    ButtonPanelComponent, DynamicFieldComponent,
    DataTableComponent, SideViewComponent, TableCellDirective,
    MatProgressBar, MatCard, MatMenuTrigger, MatIconButton, MatMenuItem,
    MatMenu, MatCardTitle, MatCardContent, AsyncPipe,
  ],
  providers: [
    TripFacadeService,
    TripFormService,
    TripLookupDataService,
  ],
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss'],
})
export class TripComponent extends BaseComponent<Trip, TripLookUpDataModel> {

  protected override readonly tableColumns = TRIP_TABLE_META;
  protected override readonly filterFormMeta = TRIP_FILTER_FORM_META;
  protected override readonly mainFormMeta = TRIP_MAIN_FORM_META;
  protected override readonly exportMeta = TRIP_DATA_EXPORT_META;
  protected override readonly actionPanelConfig =
    buildActionPanel({ exclude: ['bulk-deactivate'] });

  protected override readonly moduleName = 'Trip';
  protected override readonly excelFileName = 'trips.xlsx';

  protected override facade = inject(TripFacadeService);
  protected override formService = inject(TripFormService);

  protected readonly trips$ = this.facade.trips$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  protected override getCustomRowActions(row: Trip): Record<string, () => void> {
    return {
      'activate': () =>
        this.executeTransition(
          this.facade.activate(row),
          'Trip activated successfully.',
          row
        ),
      'suspend': () =>
        this.executeTransition(
          this.facade.suspend(row),
          'Trip suspended successfully.',
          row
        ),
      'discontinue': () =>
        this.executeTransition(
          this.facade.discontinue(row),
          'Trip discontinued successfully.',
          row
        )
    };
  }

  private executeTransition(operation$: Observable<Trip>, successMessage: string, row: Trip): void {
    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.dialog.showSuccess(successMessage),
        error: err => this.dialog.showErrorMessage('Failed to update trip', err),
        complete: () => {
          this.facade.reload();
          if (this.activeRow?.id === row.id) this.activeRow = null;
        }
      });
  }

}
