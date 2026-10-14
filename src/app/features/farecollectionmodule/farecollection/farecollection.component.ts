import {Component, inject} from '@angular/core';
import {
  FARE_COLLECTION_DATA_EXPORT_META, FARE_COLLECTION_FILTER_FORM_META,
  FARE_COLLECTION_MAIN_FORM_META,
  FARE_COLLECTION_TABLE_META
} from '../model/farecollection.meta';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {Observable,takeUntil} from 'rxjs';
import {FareCollection} from '../entity/farecollection';
import {FareCollectionMetadata} from '../model/farecollection.metadata.model';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FareCollectionFacadeService} from '../service/util/farecollectionfacade.service';
import {FareCollectionFormService} from '../service/util/farecollectionform.service';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {FareCollectionMetadataService} from '../service/util/farecollection.metadata.service';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {BaseComponent} from '../../../applicationframework/base.component';
import {CrudPageConfig} from '../../../applicationframework/crudpage.config';

@Component({
  selector: 'app-farecollection',
  imports: [
    AsyncPipe,
    MatProgressBar,
    NgIf,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    ButtonPanelComponent,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    DataTableComponent,
    MatDivider,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    SideViewComponent,
    TableCellDirective,
    MatMenuTrigger,
    MatIcon,
  ],
  templateUrl: './farecollection.component.html',
  styleUrl: './farecollection.component.scss',
  standalone: true,
  providers: [
    FareCollectionFacadeService,
    FareCollectionFormService,
    FareCollectionMetadataService,
  ],
})
export class FareCollectionComponent extends BaseComponent<FareCollection, FareCollectionMetadata> {

  protected override readonly config: CrudPageConfig = {
    tableColumns: FARE_COLLECTION_TABLE_META,
    filterFormMeta: FARE_COLLECTION_FILTER_FORM_META,
    mainFormMeta: FARE_COLLECTION_MAIN_FORM_META,
    exportMeta: FARE_COLLECTION_DATA_EXPORT_META,
    actionPanel: buildActionPanel(),
    moduleName: 'Fare Collection',
    excelFileName: 'fare-collection.xlsx',
  };

  protected override facade =
    inject(FareCollectionFacadeService);

  protected override formService =
    inject(FareCollectionFormService);

  protected override onRowAction(
    action: string,
    row: FareCollection
  ): void {

    if (action === 'reconciled') {
      this.executeTransition(
        this.facade.reconciled(row),
        'Fare Collection is Reconciled.',
        row
      );
      return;
    }

    super.onRowAction(action, row);
  }

  private executeTransition(
    operation$: Observable<FareCollection>,
    successMessage: string,
    row: FareCollection
  ): void {

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () =>
          this.dialog.showSuccess(successMessage),

        error: err =>
          this.dialog.showErrorMessage(
            'Failed to update fare collection',
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
