import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {Observable} from 'rxjs';
import {takeUntil,} from 'rxjs/operators';
import {TRIP_DATA_EXPORT_META, TRIP_FILTER_FORM_META, TRIP_MAIN_FORM_META, TRIP_TABLE_META} from '../model/trip.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {Trip} from '../entity/trip';
import {TripLookUpDataModel} from '../model/trip.lookupdata.model';
import {TripFacadeService} from '../service/util/tripfacade.service';
import {TripFormService} from '../service/util/tripfrom.service';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {TripLookupDataService} from '../service/util/trip.lookupdata.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    AsyncPipe,

    MatButton,
    MatDivider,
    MatIcon,
    MatProgressBar,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatMenuTrigger,
    MatIconButton,
    MatMenuItem,
    MatMenu,

    ButtonPanelComponent,
    DynamicFieldComponent,
    DataTableComponent,
    SideViewComponent,
    TableCellDirective,
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

  protected override readonly config: CrudPageConfig = {
    tableColumns: TRIP_TABLE_META,
    filterFormMeta: TRIP_FILTER_FORM_META,
    mainFormMeta: TRIP_MAIN_FORM_META,
    exportMeta: TRIP_DATA_EXPORT_META,

    actionPanel: buildActionPanel({
      exclude: ['bulk-deactivate'],
    }),

    moduleName: 'Trip',
    excelFileName: 'trips.xlsx',
  };

  protected override facade =
    inject(TripFacadeService);

  protected override formService =
    inject(TripFormService);

  protected override getCustomRowActions(
    row: Trip
  ): Record<string, () => void> {
    return {
      activate: () =>
        this.executeTransition(
          this.facade.activate(row),
          'Trip activated successfully.',
          row
        ),

      suspend: () =>
        this.executeTransition(
          this.facade.suspend(row),
          'Trip suspended successfully.',
          row
        ),

      discontinue: () =>
        this.executeTransition(
          this.facade.discontinue(row),
          'Trip discontinued successfully.',
          row
        ),
    };
  }

  private executeTransition(
    operation$: Observable<Trip>,
    successMessage: string,
    row: Trip
  ): void {
    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialog.showSuccess(successMessage);
        },

        error: err => {
          this.dialog.showErrorMessage(
            'Failed to update trip',
            err
          );
        },

        complete: () => {
          this.facade.reload();

          if (this.activeRow?.id === row.id) {
            this.activeRow = null;
          }
        },
      });
  }
}
