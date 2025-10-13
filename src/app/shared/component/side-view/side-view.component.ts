import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {NgIf, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-side-view',
  imports: [
    MatDrawerContainer,
    MatDrawerContent,
    MatDrawer,
    MatIcon,
    MatIconButton,
    NgTemplateOutlet,
    NgIf,
  ],
  templateUrl: './side-view.component.html',
  standalone: true,
  styleUrl: './side-view.component.scss'
})
export class SideViewComponent {

  @Input() opened = false;
  @Input() data: any;
  @Input() viewTemplate!: TemplateRef<any>;
  @Input() title = 'Details';

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

}
