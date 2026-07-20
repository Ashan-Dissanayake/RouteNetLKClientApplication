import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {DecimalPipe, NgClass, NgIf,AsyncPipe} from '@angular/common';
import {MatDivider, MatList, MatListItem, MatNavList} from '@angular/material/list';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {DashboardFacadeService} from '../dashboardfacade.service';
import {Observable, Subject} from 'rxjs';
import {MatProgressBar} from '@angular/material/progress-bar';

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
    MatProgressBar,
    MatIconButton,
    DecimalPipe,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone:true
})
export class DashboardComponent implements OnInit, OnDestroy{
// 1. Declare properties with explicit types first
  readonly metrics$: Observable<any>; // Replace 'any' with your explicit Metrics interface/model type
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<any>;

  private readonly destroy$ = new Subject<void>();

  // 2. Inject and safely assign streams inside the constructor
  constructor(private readonly dashboardFacade: DashboardFacadeService) {
    this.metrics$ = this.dashboardFacade.metrics$;
    this.loading$ = this.dashboardFacade.loading$;
    this.error$ = this.dashboardFacade.error$;
  }

  ngOnInit(): void {
    this.dashboardFacade.loadDashboardMetrics();
  }

  onRefreshMetrics(): void {
    this.dashboardFacade.loadDashboardMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dashboardFacade.clearState();
  }

}
