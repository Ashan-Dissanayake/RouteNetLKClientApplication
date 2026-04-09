import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'branch', loadComponent: () => import('./features/branchmodule/branch/branch.component').
        then(m => m.BranchComponent)
      },
      { path: 'employee', loadComponent: () => import('./features/employeemodule/employee/employee.component').
        then(m => m.EmployeeComponent)
      },
      { path: 'vehicle', loadComponent: () => import('./features/vehiclemodule/vehicle/vehicle.component').
        then(m => m.VehicleComponent)
      },
      { path: 'driver', loadComponent: () => import('./features/crew/driver/driver.component').
        then(m => m.DriverComponent)
      },
      { path: 'conductor', loadComponent: () => import('./features/crew/conductor/conductor.component').
        then(m => m.ConductorComponent)
      },
      { path: 'permit', loadComponent: () => import('./features/permitmodule/permit/permit.component').
        then(m => m.PermitComponent)
      },
      { path: 'part', loadComponent: () => import('./features/sparepartmodule/sparepart/sparepart.component').
        then(m => m.SparepartComponent)
      },
      { path: 'part-request', loadComponent: () => import('./features/partrequestmodule/partrequest/partrequest.component').
        then(m => m.PartRequestComponent)
      },
      { path: 'grn', loadComponent: () => import('./features/grnmodule/grn/grn.component').
        then(m => m.GrnComponent)
      },
    ]
  },
];
