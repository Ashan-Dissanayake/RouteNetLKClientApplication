import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'branch', loadComponent: () => import('./features/branchmodule/branch/branch.component').then(m => m.BranchComponent) },
    ]
  },
];
