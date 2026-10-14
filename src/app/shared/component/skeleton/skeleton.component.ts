import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'skeleton ' + className"
      [style.width]="width"
      [style.height]="height"
    ></div>
  `,
  styles: [`
    :host {
      display: inline-block;
      width: 100%;
    }
  `]
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() className: string = '';
}
