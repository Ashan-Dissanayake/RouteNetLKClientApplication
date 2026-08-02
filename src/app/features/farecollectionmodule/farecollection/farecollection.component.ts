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
import {BaseComponent} from '../../../shared/base/base.component';

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
    MatIcon
  ],
  templateUrl: './farecollection.component.html',
  styleUrl: './farecollection.component.scss',
  standalone:true,
  providers: [
    FareCollectionFacadeService,
    FareCollectionFormService,
    FareCollectionMetadataService,
  ]
})
export class FareCollectionComponent extends BaseComponent<FareCollection, FareCollectionMetadata> {

  protected override readonly tableColumns = FARE_COLLECTION_TABLE_META;
  protected override readonly filterFormMeta = FARE_COLLECTION_FILTER_FORM_META;
  protected override readonly mainFormMeta = FARE_COLLECTION_MAIN_FORM_META;
  protected override readonly exportMeta = FARE_COLLECTION_DATA_EXPORT_META;
  protected override readonly actionPanelConfig = buildActionPanel();

  protected override readonly moduleName = 'Fare Collection';
  protected override readonly excelFileName = 'fare-collection.xlsx';

  protected override facade = inject(FareCollectionFacadeService);
  protected override formService = inject(FareCollectionFormService);

  protected readonly fareCollections$ = this.facade.fareCollections$;
  protected readonly metadata$ = this.facade.metadata$;
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  protected override getCustomRowActions(row: FareCollection): Record<string, () => void> {
    return {
      reconciled: () =>
        this.executeTransition(
          this.facade.reconciled(row),
          'Fare Collection is Reconciled.',
          row
        )
    };
  }

  private executeTransition(operation$: Observable<FareCollection>, successMessage: string, row: FareCollection): void {
    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.dialog.showSuccess(successMessage),
        error: err => this.dialog.showErrorMessage('Failed to update fare collection', err),
        complete: () => {
          this.facade.reload();
          if(this.activeRow?.id === row.id){
            this.activeRow = null;
          }
        }
      });
  }

}
