import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatRow,
  MatRowDef, MatTable
} from '@angular/material/table';
import {NgClass} from '@angular/common';
import {MatDivider, MatList, MatListItem, MatNavList} from '@angular/material/list';
import {MatButton} from '@angular/material/button';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardContent,
    MatCard,
    MatIcon,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    NgClass,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderCellDef,
    MatRow,
    MatNavList,
    MatListItem,
    MatButton,
    MatDivider,
    MatTable,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatList,
    MatGridList,
    MatGridTile,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone:true
})
export class DashboardComponent {

}
