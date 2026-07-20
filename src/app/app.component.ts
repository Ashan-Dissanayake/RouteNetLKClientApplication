import {Component, ViewChild, inject, computed} from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import {NgIf, NgFor} from '@angular/common';
import {MAT_DATE_FORMATS, MatDateFormats, provideNativeDateAdapter} from "@angular/material/core";
import {AuthService} from './security/auth.service';
import {NgxPermissionsModule, NgxPermissionsService} from 'ngx-permissions';


interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
  permission?: string | string[];
}

const formats: MatDateFormats = {
  parse: { dateInput: 'yyyy-MM-dd' },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'yyyy-MM-dd',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: formats }
  ],
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
    NgIf,
    NgFor,
    NgxPermissionsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  private authService = inject(AuthService);
  private router = inject(Router);


  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;
  isCollapsed = false;
  isAuthenticated = this.authService.isAuthenticated;

  // Redesigned with cleaner, industry-standard enterprise icons
  menuItems: MenuItem[] = [
    { icon: 'space_dashboard',
      label: 'Dashboard',
      route: '/admin/dashboard',
      permission:'dashboard-view'
    },
    {
      icon: 'date_range',
      label: 'Planning & Scheduling',
      children: [
        { icon: 'badge', label: 'Employee Registry', route: '/employee', permission: 'employee-view' },
        { icon: 'airline_seat_recline_normal', label: 'Drivers', route: '/driver', permission: 'driver-view' },
        { icon: 'assignment_ind', label: 'Conductors', route: '/conductor', permission: 'conductor-view' },
        { icon: 'subtitles', label: 'Route Permits', route: '/permit', permission: 'permit-view' },
        { icon: 'alt_route', label: 'Trip Configurations', route: '/trip', permission: 'trip-view' },
        { icon: 'table_chart', label: 'Roster Management', route: '/roster', permission: 'roster-view' },
      ],
      expanded: false
    },
    {
      icon: 'rv_hookup',
      label: 'Depot Operations',
      children: [
        { icon: 'play_circle_filled', label: 'Trip Execution', route: '/trip-execution', permission: 'trip-execution-view' },
        { icon: 'gpp_maybe', label: 'Incident Logs', route: '/incident-report', permission: 'incident-select' },
        { icon: 'commute', label: 'Vehicle Allocation', route: '/incident-vehicle-allocation', permission: 'incident-vehicle-allocation-view' },
        { icon: 'account_balance_wallet', label: 'Fare Collection', route: '/fare-collection', permission: 'fare-collection-view' },
      ],
      expanded: false
    },
    {
      icon: 'handyman',
      label: 'Maintenance & Garage',
      children: [
        { icon: 'directions_bus', label: 'Fleet Inventory', route: '/vehicle', permission: 'vehicle-view' },
        { icon: 'build_circle', label: 'Vehicle Service Logs', route: '/vehicle-service', permission: 'vehicle-service-view' },
        { icon: 'settings', label: 'Spare Parts Registry', route: '/part', permission: 'part-select' },
        { icon: 'shopping_cart', label: 'Part Requests', route: '/part-request', permission: 'part-request-view' },
        { icon: 'receipt_long', label: 'Good Receive Notes (GRN)', route: '/grn', permission: 'grn-view' },
      ],
      expanded: false
    },
    {
      icon: 'assessment',
      label: 'Reports',
      children: [
        { icon: 'space_dashboard', label: 'Report-1', route: '/report-1' },
        { icon: 'receipt_long', label: 'Report-2', route: '/report-2' },
        { icon: 'trending_up', label: 'Report-3', route: '/report-3' },
        { icon: 'history', label: 'Report-4', route: '/report-4' },
        { icon: 'pie_chart ', label: 'Report-5', route: '/report-5' },
      ],
    },
    {
      icon: 'admin_panel_settings',
      label: 'System Administration',
      children: [
        { icon: 'manage_accounts', label: 'User Accounts', route: '/user', permission: 'user-view' },
        { icon: 'lock_open', label: 'User Privileges', route: '/privilege', permission: 'privilege-view' },
        { icon: 'corporate_fare', label: 'Depot Branches', route: '/branch', permission: 'branch-view' },
      ],
      expanded: false
    }

  ];



  filteredMenuItems = computed(() => {
    if (!this.isAuthenticated()) {
      return [];
    }
    return this.filterMenuItemsByPermissions(this.menuItems);
  });

  constructor(
    private observer: BreakpointObserver,
    private permissionsService:NgxPermissionsService
  ) {
    this.observer.observe(['(max-width: 800px)']).subscribe((result) => {
      this.isMobile = result.matches;
      this.isCollapsed = this.isMobile;
      if (this.isMobile) {
        this.menuItems.forEach(item => item.expanded = false);
      }
    });
  }

  private filterMenuItemsByPermissions(items: MenuItem[]): MenuItem[] {

    return items
      .map(item => {

        const cloned = {...item};

        if(item.children){
          cloned.children =
            this.filterMenuItemsByPermissions(item.children);
        }

        return cloned;
      })
      .filter(item => {

        if(item.permission){

          const permissions = Array.isArray(item.permission)
            ? item.permission
            : [item.permission];
          return permissions.some(permission =>
            this.permissionsService.getPermissions()
              .hasOwnProperty(permission)
          );
        }
        return !(item.children &&
          item.children.length === 0);
      });
  }

  toggleSidenav() {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  toggleSubMenu(item: MenuItem) {
    item.expanded = !item.expanded;
    if (this.isMobile && item.expanded) {
      this.filteredMenuItems().forEach(i => {
        if (i !== item) i.expanded = false;
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
