import { Routes } from '@angular/router';
import {BranchComponent} from './features/branchmodule/branch/branch.component';

export const routes: Routes = [
  { path: '', redirectTo: 'test', pathMatch: 'full' },
  { path: 'test', component: BranchComponent } // standalone component

];
