import {Component, OnDestroy, OnInit} from '@angular/core';
import {PrivilegeFacadeService} from '../service/util/privilegefacade.service';
import {PrivilegeFormService} from '../service/util/privilegeform.service';
import {PrivilegeLookUpDataService} from '../service/util/privilege.lookupdata.service';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {
  PRIVILEGE_FILTER_FORM_META,
  PRIVILEGE_IMMUTABLE_CONTROLLERS_META,
  PRIVILEGE_MAIN_FORM_META,
  PRIVILEGE_TABLE_META
} from '../model/privilege.meta';
import {debounceTime, Observable, Subject, take, takeUntil} from 'rxjs';
import {Privilege} from '../entity/privilege';
import {PrivilegeLookUpData} from '../model/privilege.lookupdata.model';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormbuilderService} from '../../../core/formbuilder.service';
import {DialogService} from '../../../core/dialog.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {
  ButtonClickEvent,
  ButtonPanelComponent
} from '../../../shared/component/button/button-panel/button-panel.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {NgxPermissionsModule} from 'ngx-permissions';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-privilege',
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
    NgForOf,
    ReactiveFormsModule,
    DataTableComponent,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    NgxPermissionsModule,
    SideViewComponent,
    TableCellDirective,
    MatMenuTrigger
  ],
  templateUrl: './privilege.component.html',
  styleUrl: './privilege.component.scss',
  standalone:true,
  providers:[
    PrivilegeFacadeService,
    PrivilegeFormService,
    PrivilegeLookUpDataService
  ]
})
export class PrivilegeComponent{

}
