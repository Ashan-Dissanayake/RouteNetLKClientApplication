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
      { path: 'crew', loadComponent: () => import('./features/drivermodule/driver/driver.component').
        then(m => m.DriverComponent)
      },
    ]
  },
];
