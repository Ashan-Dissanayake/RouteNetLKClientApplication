import {Component, inject} from '@angular/core';
import {Employee} from '../entity/employee';
import {EmployeeFacadeService} from '../services/util/employeefacade.service';
import {CheckboxEvent, DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {MatIconButton} from '@angular/material/button';
import {SideViewComponent} from '../../../shared/component/side-view/side-view.component';
import {TableCellDirective} from '../../../shared/component/data-table/table-cell.directive';
import {MatIcon} from '@angular/material/icon';
import {
  EMPLOYEE_DATA_EXPORT_META,
  EMPLOYEE_FILTER_FORM_META, EMPLOYEE_IMMUTABLE_CONTROLLERS_META, EMPLOYEE_MAIN_FORM_META,
  EMPLOYEE_TABLE_META,
} from '../model/employee.meta';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DynamicFieldComponent} from '../../../shared/component/form/dynamic-field.component';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
import {buildActionPanel} from '../../../shared/component/button/action-panel.factory';
import {EmployeeFormService} from '../services/util/employeefrom.service';
import {EmployeeMetadataService} from '../services/util/employee.metadata.service';
import {EmployeeMetadata} from '../model/employee.metadata.model';
import {BaseComponent} from '../../../shared/base/base.component';
import {async} from 'rxjs';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  standalone: true,
  imports: [
    DataTableComponent,
    MatIcon,
    SideViewComponent,
    TableCellDirective,
    DatePipe,
    MatDivider,
    NgClass,
    DynamicFieldComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ButtonPanelComponent,
    MatIconButton,
    AsyncPipe,
  ],
  styleUrl: './employee.component.scss',
  providers: [
    EmployeeFacadeService,
    EmployeeFormService,
    EmployeeMetadataService,
  ],
})
export class EmployeeComponent extends BaseComponent<Employee, EmployeeMetadata> {

  // ===== Static configuration =====
  protected override readonly tableColumns    = EMPLOYEE_TABLE_META;
  protected override readonly filterFormMeta  = EMPLOYEE_FILTER_FORM_META;
  protected override readonly mainFormMeta    = EMPLOYEE_MAIN_FORM_META;
  protected override readonly exportMeta      = EMPLOYEE_DATA_EXPORT_META;
  protected override readonly immutableControllers = EMPLOYEE_IMMUTABLE_CONTROLLERS_META;
  protected override readonly actionPanelConfig = buildActionPanel();

  protected override readonly moduleName = 'Employee';
  protected override readonly excelFileName = 'employees.xlsx';

  // ===== Subclass services resolution =====
  protected override facade = inject(EmployeeFacadeService);
  protected override formService = inject(EmployeeFormService);

  // ===== Template-accessible streams mapping =====
  protected readonly employees$ = this.facade.employees$;
  protected readonly metadata$  = this.facade.metadata$;
  protected readonly loading$   = this.facade.loading$;
  protected readonly error$     = this.facade.error$;

  // ===== Overridden hooks =====
  protected override getDeactivateConfirmationMessage(): string {
    return 'Only resigned employees will be deactivated. Are you sure?';
  }
}
