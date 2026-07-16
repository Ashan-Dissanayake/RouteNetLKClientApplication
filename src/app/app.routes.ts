import { Routes } from '@angular/router';
import { authGuard } from './security/auth.guard';
import {permissionGuard} from './security/permission.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: '',
    canActivate: [authGuard],
    children: [

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },


      // Planning & Scheduling
      {
        path: 'employee',
        canActivate: [permissionGuard('employee-view')],
        loadComponent: () =>
          import('./features/employeemodule/employee/employee.component')
            .then(m => m.EmployeeComponent)
      },

      {
        path: 'driver',
        canActivate: [permissionGuard('employee-view')],
        loadComponent: () =>
          import('./features/crew/driver/driver.component')
            .then(m => m.DriverComponent)
      },

      {
        path: 'conductor',
        canActivate: [permissionGuard('employee-view')],
        loadComponent: () =>
          import('./features/crew/conductor/conductor.component')
            .then(m => m.ConductorComponent)
      },

      {
        path: 'permit',
        canActivate: [permissionGuard('permit-view')],
        loadComponent: () =>
          import('./features/permitmodule/permit/permit.component')
            .then(m => m.PermitComponent)
      },

      {
        path: 'trip',
        canActivate: [permissionGuard('trip-view')],
        loadComponent: () =>
          import('./features/tripmodule/trip/trip.component')
            .then(m => m.TripComponent)
      },

      {
        path: 'roster',
        canActivate: [permissionGuard('roster-view')],
        loadComponent: () =>
          import('./features/rostermodule/roster/roster.component')
            .then(m => m.RosterComponent)
      },


      // Depot Operations
      {
        path: 'trip-execution',
        canActivate: [permissionGuard('trip-execution-view')],
        loadComponent: () =>
          import('./features/tripexecution/tripexecution/tripexecution.component')
            .then(m => m.TripExecutionComponent)
      },

      {
        path: 'incident-report',
        canActivate: [permissionGuard('incident-select')],
        loadComponent: () =>
          import('./features/incidentreportmodule/incidentreport/incidentreport.component')
            .then(m => m.IncidentReportComponent)
      },

      {
        path: 'incident-vehicle-allocation',
        canActivate: [permissionGuard('incident-vehicle-allocation-view')],
        loadComponent: () =>
          import('./features/incidentvehicleallocationmodule/incidentvehicleallocation/incidentvehicleallocation.component')
            .then(m => m.IncidentVehicleAllocationComponent)
      },

      {
        path: 'fare-collection',
        canActivate: [permissionGuard('fare-collection-view')],
        loadComponent: () =>
          import('./features/farecollectionmodule/farecollection/farecollection.component')
            .then(m => m.FareCollectionComponent)
      },


      // Maintenance
      {
        path: 'vehicle',
        canActivate: [permissionGuard('vehicle-view')],
        loadComponent: () =>
          import('./features/vehiclemodule/vehicle/vehicle.component')
            .then(m => m.VehicleComponent)
      },

      {
        path: 'vehicle-service',
        canActivate: [permissionGuard('vehicle-service-view')],
        loadComponent: () =>
          import('./features/vehicleservicemodule/vehicleservice/vehicleservice.component')
            .then(m => m.VehicleServiceComponent)
      },

      {
        path: 'part',
        canActivate: [permissionGuard('part-select')],
        loadComponent: () =>
          import('./features/sparepartmodule/sparepart/sparepart.component')
            .then(m => m.SparePartComponent)
      },

      {
        path: 'part-request',
        canActivate: [permissionGuard('part-request-view')],
        loadComponent: () =>
          import('./features/partrequestmodule/partrequest/partrequest.component')
            .then(m => m.PartRequestComponent)
      },

      {
        path: 'grn',
        canActivate: [permissionGuard('grn-view')],
        loadComponent: () =>
          import('./features/grnmodule/grn/grn.component')
            .then(m => m.GrnComponent)
      },


      // Reports
      {
        path: 'report-1',
        loadComponent: () =>
          import('./reports/report-1/report-1.component')
            .then(m => m.Report1Component)
      },

      {
        path: 'report-2',
        loadComponent: () =>
          import('./reports/report-2/report-2.component')
            .then(m => m.Report2Component)
      },

      {
        path: 'report-3',
        loadComponent: () =>
          import('./reports/report-3/report-3.component')
            .then(m => m.Report3Component)
      },

      {
        path: 'report-4',
        loadComponent: () =>
          import('./reports/report-4/report-4.component')
            .then(m => m.Report4Component)
      },

      {
        path: 'report-5',
        loadComponent: () =>
          import('./reports/report-5/report-5.component')
            .then(m => m.Report5Component)
      },


      //System Administration
      {
        path: 'user',
        canActivate: [permissionGuard('user-view')],
        loadComponent: () =>
          import('./features/usermodule/user/user.component')
            .then(m => m.UserComponent)
      },

      {
        path: 'branch',
        canActivate: [permissionGuard('branch-view')],
        loadComponent: () =>
          import('./features/branchmodule/branch/branch.component')
            .then(m => m.BranchComponent)
      }

    ]
  },


  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];
