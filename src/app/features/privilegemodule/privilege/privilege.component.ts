import {Component, OnDestroy, OnInit} from '@angular/core';
import {PrivilegeFacadeService} from '../service/util/privilegefacade.service';
import {PrivilegeFormService} from '../service/util/privilegeform.service';
import {PrivilegeLookUpDataService} from '../service/util/privilege.lookupdata.service';
import {ReactiveFormsModule} from '@angular/forms';
import { DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {ButtonPanelComponent} from '../../../shared/component/button/button-panel/button-panel.component';
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
import {MatCheckbox} from '@angular/material/checkbox';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {combineLatest, Observable, Subject, takeUntil} from 'rxjs';
import {Role} from '../../usermodule/entity/role';
import {Module} from '../entity/module';
import {Operation} from '../entity/operation';
import {Privilege} from '../entity/privilege';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

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
    MatMenuTrigger,
    MatCheckbox,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatProgressSpinner
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
  private destroy$ = new Subject<void>();

  // UI Render Array
  matrixModules: UiMatrixModule[] = [];

  // Expose status streams for template loading states
  protected readonly loading$:               Observable<boolean>;

  constructor(
    private facade: PrivilegeFacadeService
  ) {
    this.loading$                = this.facade.loading$;
  }

  ngOnInit(): void {
    // 1. Trigger lookup and master data load sequence
    this.facade.initialize().pipe(takeUntil(this.destroy$)).subscribe();

    // 2. Combine lookups and current active privileges to compute grid states reactively
    combineLatest({
      lookups: this.facade.lookUpData$,
      activePrivileges: this.facade.privileges$
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ lookups, activePrivileges }) => {
        this.buildMatrix(lookups.roles, lookups.modules, lookups.operations, activePrivileges);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Transforms relational data into an organized Matrix grouped by Module -> Operations -> Roles
   */
  private buildMatrix(roles: Role[], modules: Module[], operations: Operation[], activePrivileges: Privilege[]): void {
    this.matrixModules = modules.map(mod => {
      // Find operations assigned to this module based on your schema foreign keys
      const moduleOps = operations.filter(op => op.module.id === mod.id);

      // Construct a structural configuration mapping for each system user role
      const rows: MatrixRow[] = roles.map(role => {
        const cellState: { [operationId: number]: Privilege | null } = {};

        moduleOps.forEach(op => {
          // Identify if a mapping entry exists in the privilege list
          const activePriv = activePrivileges.find(p =>
            p.role.id === role.id &&
            p.module.id === mod.id &&
            p.operation.id === op.id
          );
          cellState[op.id] = activePriv || null;
        });

        return { role, cellState };
      });

      return { module: mod, operations: moduleOps, rows };
    });
  }

  /**
   * Dispatches network calls on toggle interactions based on the presence of existing IDs
   */
  onToggleCell(
    roleId: number,
    moduleId: number,
    operationId: number,
    existingPrivilege: Privilege | null,
    checked: boolean
  ): void {

    if (checked && !existingPrivilege) {

      const privilegePayload = {
        module: {
          id: moduleId
        },
        operation: {
          id: operationId
        }
      };

      this.facade.assignPrivileges(roleId, [privilegePayload])
        .subscribe({
          next: () => this.facade.reload()
        });

    } else if (!checked && existingPrivilege) {

      this.facade.revokePrivileges(roleId, [existingPrivilege])
        .subscribe({
          next: () => this.facade.reload()
        });
    }
  }

}

interface MatrixRow {
  role: Role;
  // Maps operation_id -> active Privilege object if assigned, or null if unassigned
  cellState: { [operationId: number]: Privilege | null };
}

interface UiMatrixModule {
  module: Module;
  operations: Operation[];
  rows: MatrixRow[];
}
