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

  @Input() buttons: ButtonAction[] = [];  // Dynamic list of buttons
  @Output() actionClicked = new EventEmitter<string>(); // Emits button type when clicked

  onClick(button: ButtonAction) {
    if (!button.disabled) {
      this.actionClicked.emit(button.type);
    }
  }

}

export interface ButtonAction {
  label: string;                   // Button text
  type: string;                     // Identifier for click handling
  icon?: string;                    // Optional icon name
  color?: 'primary' | 'accent' | 'warn';  // Optional color
  disabled?: boolean;               // Optional disabled
  dropdown?: { label: string; type: string }[]; // Optional dropdown for nested actions
}
