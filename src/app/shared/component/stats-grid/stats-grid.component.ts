import {Component, Input} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-stats-grid',
  imports: [
    MatCard,
    MatGridTile,
    MatGridList,
    NgForOf
  ],
  templateUrl: './stats-grid.component.html',
  standalone: true,
  styleUrl: './stats-grid.component.scss'
})
export class StatsGridComponent {

  @Input() stats: { label: string; value: number | string }[] = [];
  @Input() cols: number = 4;      // configurable grid columns
  @Input() rowHeight: string = '5rem';
  @Input() gutterSize: string = '20px';

}
