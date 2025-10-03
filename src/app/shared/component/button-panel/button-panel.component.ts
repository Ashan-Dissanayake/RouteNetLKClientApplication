import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';


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
export class ButtonPanelComponent {

  @Input() buttons: ButtonAction[] = [];
  @Output() actionClicked = new EventEmitter<ButtonClickEvent>();
  @Output() dropdownClicked = new EventEmitter<ButtonClickEvent>();

  onClick(button: ButtonAction, fromDropdown = false) {
    const event: ButtonClickEvent = { type: button.type, source: button };
    if (!this.isDisabled(button)) {
      this.actionClicked.emit(event);
      if (fromDropdown) {
        this.dropdownClicked.emit(event);
      }
    }
  }

  //Evaluate disabled state (supports boolean or function)
  isDisabled(button: ButtonAction): boolean {
    return typeof button.disabled === 'function'
      ? button.disabled()
      : !!button.disabled;
  }

  //Return unique menu ID for each button
  menuId(index: number): string {
    return `menu-${index}`;
  }

}

export interface ButtonAction {
  label: string;                                // Button text
  type: string;                                 // Identifier for click handling
  icon?: string;                                // Optional icon name
  iconType?: 'mat' | 'fa' | 'custom';           // Support multiple icon sets
  color?: 'primary' | 'accent' | 'warn';        // Material color scheme
  disabled?: boolean | (() => boolean);         // Can be boolean or function
  dropdown?: ButtonAction[];                    // Nested actions
  group?: string;                               // Optional grouping
}

export interface ButtonClickEvent {
  type: string;
  source: ButtonAction;
}
