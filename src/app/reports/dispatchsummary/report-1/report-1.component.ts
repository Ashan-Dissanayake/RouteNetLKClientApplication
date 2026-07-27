import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {ReportService} from '../../service/reportservice';
import {Report1Response} from '../entity/report1response';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';
import {DialogService} from '../../../core/dialog.service';

@Component({
  selector: 'app-report-1',
  imports: [
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCard,
    MatCardContent,
    MatDivider,
    MatCardFooter,
    MatIcon,
    MatProgressSpinner,
    NgIf,
  ],
  templateUrl: './report-1.component.html',
  styleUrl: './report-1.component.scss',
  standalone:true
})
export class Report1Component implements OnInit, OnDestroy {
  @ViewChild('dimensionsChart', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  public reportData!: Report1Response;
  public isLoading = true;

  constructor(
    private reportService: ReportService,
    private dialogService:DialogService
  ) {}

  ngOnInit(): void {
    this.fetchReportData();
  }

  fetchReportData(): void {
    this.reportService.getReport1Metrics().subscribe({
      next: (data: Report1Response) => {
        this.reportData = data;
        this.isLoading = false;
        this.renderChart();
      },
      error: (err) => {
        this.dialogService.showError('Error fetching operational report data:', err);
        this.isLoading = false;
      }
    });
  }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.reportData.days,
        datasets: [
          {
            label: 'Successful Trip Executions',
            data: this.reportData.successfulTrips,
            backgroundColor: '#115E63',
            borderColor: '#072F32',
            borderWidth: 1
          },
          {
            label: 'Logged Breakdown Incidents',
            data: this.reportData.breakdownCounts,
            backgroundColor: '#DC2626',
            borderColor: '#991B1B',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 12, weight: 500 }, color: '#475569' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748B', font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Operations / Incidents Count', color: '#475569', font: { weight: 600 } },
            grid: { color: '#E2E8F0' },
            ticks: { color: '#64748B' }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
