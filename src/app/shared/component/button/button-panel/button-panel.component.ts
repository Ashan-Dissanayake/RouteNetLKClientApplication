import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
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
export class ButtonPanelComponent implements OnChanges{

  @Input() buttons: ButtonAction[] = [];
  @Input() contextData: any;
  @Output() actionClicked = new EventEmitter<ButtonClickEvent>();
  @Output() dropdownClicked = new EventEmitter<ButtonClickEvent>();

  ngOnChanges() {
    this.configureActions();
  }

  onClick(button: ButtonAction, fromDropdown = false) {
    const event: ButtonClickEvent = { type: button.type, source: button };
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

  configureActions(): void {
    this.buttons.forEach(btn => {
      if (btn.type === 'bulk-deactivate') {
        btn.disabled = (ctx: any) => ctx.selectedRows?.size === 0;
      }
    });
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
}

export interface ButtonClickEvent {
  type: string;
  source: ButtonAction;
}
