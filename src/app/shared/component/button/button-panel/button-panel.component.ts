import {Component, EventEmitter, Input, OnChanges, Output, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {NgxPermissionsService} from 'ngx-permissions';


@Component({
  selector: 'app-button-panel',
  imports: [
    MatButton,
    NgIf,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    NgForOf,
    MatIcon
  ],
  templateUrl: './button-panel.component.html',
  standalone: true,
  styleUrl: './button-panel.component.scss'
})
export class ButtonPanelComponent implements OnChanges{

  @Input() buttons: ButtonAction[] = [];
  @Input() contextData: any;
  @Output() actionClicked = new EventEmitter<ButtonClickEvent>();
  @Output() dropdownClicked = new EventEmitter<ButtonClickEvent>();

  filteredButtons: ButtonAction[] = [];

  constructor(
    private permissionsService:NgxPermissionsService
  ) {
  }

  ngOnChanges(): void {
    this.configureActions();
    this.filterButtonsByPermission();
  }


  onClick(button: ButtonAction, fromDropdown = false): void {
    const event: ButtonClickEvent = {
      type: button.type,
      source: button
    };

    if (!this.isDisabled(button)) {
      this.actionClicked.emit(event);
      if (fromDropdown) {
        this.dropdownClicked.emit(event);
      }
    }
  }

  isDisabled(button: ButtonAction): boolean {
    return typeof button.disabled === 'function'
      ? button.disabled(this.contextData)
      : !!button.disabled;
  }


  private configureActions(): void {
    this.buttons.forEach(btn => {
      if (btn.type === 'bulk-deactivate') {
        btn.disabled = (ctx: any) =>
          !ctx?.selectedRows ||
          ctx.selectedRows.size === 0;
      }
    });
  }

  private filterButtonsByPermission(): void {

    this.filteredButtons = this.buttons
      .map(button => {

        const filteredDropdown = button.dropdown
          ?.filter(item =>
            !item.permission ||
            this.hasPermission(item.permission)
          );

        return {
          ...button,
          dropdown: filteredDropdown
        };

      })
      .filter(button => {

        if (!button.permission) {
          return true;
        }

        return this.hasPermission(button.permission);

      });
  }

  private hasPermission(permission: string | string[]): boolean {
    const permissions = Array.isArray(permission)
      ? permission
      : [permission];

    return permissions.some(permission =>
      !!this.permissionsService.getPermission(permission)
    );
  }


}

export interface ButtonAction {
  label: string;                                // Button text
  type: string;                                 // Identifier for click handling
  icon?: string;                                // Optional icon name
  iconType?: 'mat' | 'fa' | 'custom';           // Support multiple icon sets
  color?: 'red' | 'accent' | 'warn';        // Material color scheme
  disabled?: boolean | ((contextData: any) => boolean);         // Can be boolean or function
  dropdown?: ButtonAction[];                    // Nested actions
  group?: string;                               // Optional grouping
  permission?: string | string[];               // Permissions required to view this action
}

export interface ButtonClickEvent {
  type: string;
  source: ButtonAction;
}
