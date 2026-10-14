import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {PrivilegeFacadeService} from '../service/util/privilegefacade.service';
import {PrivilegeLookUpDataService} from '../service/util/privilege.lookupdata.service';
import {ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {NgxPermissionsModule} from 'ngx-permissions';
import {MatCheckbox} from '@angular/material/checkbox';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {combineLatest, Subject, takeUntil} from 'rxjs';
import {Role} from '../../usermodule/entity/role';
import {Module} from '../entity/module';
import {Operation} from '../entity/operation';
import {Privilege} from '../entity/privilege';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-privilege',
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    ReactiveFormsModule,
    NgxPermissionsModule,
    MatCheckbox,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatProgressSpinner,
  ],
  templateUrl: './privilege.component.html',
  styleUrl: './privilege.component.scss',
  standalone: true,
  providers: [
    PrivilegeFacadeService,
    PrivilegeLookUpDataService,
  ],
})
export class PrivilegeComponent implements OnInit, OnDestroy {

  protected readonly facade = inject(PrivilegeFacadeService);

  private readonly destroy$ = new Subject<void>();
  protected readonly loading$ = this.facade.loading$;
  protected readonly error$ = this.facade.error$;

  matrixModules: UiMatrixModule[] = [];

  constructor(
  ) {}

  ngOnInit(): void {

    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: err => {
          // Optional: show error message through your DialogService
          console.error('Failed to initialize privilege module.', err);
        }
      });

    combineLatest({
      metadata: this.facade.metadata$,
      privileges: this.facade.items$,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ metadata, privileges }) => {

        this.buildMatrix(
          metadata.roles,
          metadata.modules,
          metadata.operations,
          privileges
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Converts relational privilege data into the
   * Module → Operations → Roles UI matrix.
   */
  private buildMatrix(
    roles: Role[],
    modules: Module[],
    operations: Operation[],
    activePrivileges: Privilege[]
  ): void {

    this.matrixModules = modules.map(module => {

      const moduleOperations = operations.filter(
        operation =>
          operation.module.id === module.id
      );

      const rows: MatrixRow[] = roles.map(role => {

        const cellState: {
          [operationId: number]: Privilege | null;
        } = {};

        moduleOperations.forEach(operation => {

          const activePrivilege =
            activePrivileges.find(privilege =>
              privilege.role.id === role.id &&
              privilege.module.id === module.id &&
              privilege.operation.id === operation.id
            );

          cellState[operation.id] =
            activePrivilege ?? null;
        });

        return {
          role,
          cellState,
        };
      });

      return {
        module,
        operations: moduleOperations,
        rows,
      };
    });
  }

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
          id: moduleId,
        },
        operation: {
          id: operationId,
        },
      };

      this.facade
        .assignPrivileges(roleId, [privilegePayload])
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.facade.reload(),
          error: err => {
            console.error(
              'Failed to assign privilege.',
              err
            );
          },
        });

      return;
    }

    if (!checked && existingPrivilege) {

      this.facade
        .revokePrivileges(roleId, [existingPrivilege])
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.facade.reload(),
          error: err => {
            console.error(
              'Failed to revoke privilege.',
              err
            );
          },
        });
    }
  }
}

interface MatrixRow {
  role: Role;
  cellState: {
    [operationId: number]: Privilege | null;
  };
}

interface UiMatrixModule {
  module: Module;
  operations: Operation[];
  rows: MatrixRow[];
}
