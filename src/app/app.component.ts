import {Component, ViewChild} from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import {NgIf} from '@angular/common';
import {MAT_DATE_FORMATS, MatDateFormats, provideNativeDateAdapter} from "@angular/material/core";


interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

const formats: MatDateFormats = {
  parse: {
    dateInput: 'yyyy-MM-dd',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'yyyy-MM-dd',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

// ---------------------------------------//


@Component({
  selector: 'app-root',
  standalone: true,
  providers: [
    // Provide the adapter first
    provideNativeDateAdapter(),
    // Override the formats globaly
    { provide: MAT_DATE_FORMATS, useValue: formats }
  ],
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
    //NgClass,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;
  isCollapsed = false;

  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Home', route: '/' },
    {
      icon: 'admin_panel_settings',
      label: 'Admin',
      children: [
        { icon: 'badge', label: 'Employee', route: '/admin/employee' },
        { icon: 'person', label: 'User', route: '/admin/user' },
        { icon: 'account_tree', label: 'Branch', route: '/admin/branch' },
        { icon: 'directions_bus', label: 'Vehicle', route: '/admin/vehicle' },
        { icon: 'groups', label: 'Driver', route: '/admin/driver' },
        { icon: 'groups', label: 'Conductor', route: '/admin/conductor' },
        { icon: 'assignment', label: 'Permit', route: '/admin/permit' },
        { icon: 'precision_manufacturing', label: 'Part', route: '/admin/part' },
        { icon: 'shopping_cart_checkout', label: 'Part Request', route: '/admin/part-request' },
        { icon: 'assignment_turned_in', label: 'GRN', route: '/admin/grn' },
        { icon: 'navigation', label: 'Trip', route: '/admin/trip' },
        { icon: 'calendar_month', label: 'Roster', route: '/admin/roster' },
        { icon: 'route', label: 'Trp Execution', route: '/admin/trip-execution' },
        { icon: 'report_problem', label: 'Incident Report', route: '/admin/incident-report' },
        { icon: 'settings_backup_restore', label: 'Incident Vehicle Allocation', route: '/admin/incident-vehicle-allocation' },
      ],
      expanded: false
    },
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' }
  ];

  constructor(private observer: BreakpointObserver) {
    this.observer.observe(['(max-width: 800px)']).subscribe((result) => {
      this.isMobile = result.matches;
      this.isCollapsed = this.isMobile;
      if (this.isMobile) {
        this.menuItems.forEach(item => item.expanded = false); // Collapse sub-menus on mobile
      }
    });
  }

  toggleSidenav() {
    if (this.isMobile) {
      this.sidenav.toggle().then(r => {
        console.log(r);
      });
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  toggleSubMenu(item: MenuItem) {
    item.expanded = !item.expanded;
    if (this.isMobile && item.expanded) {
      this.menuItems.forEach(i => {
        if (i !== item) i.expanded = false; // Collapse other sub-menus
      });
    }
  }
}


