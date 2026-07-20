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
import {Report2Response} from '../entity/report2response';
import {ReportService} from '../../service/reportservice';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-report-2',
  imports: [
    MatCardTitle,
    MatCard,
    MatCardSubtitle,
    MatCardContent,
    MatDivider,
    MatCardHeader,
    MatProgressSpinner,
    MatCardFooter,
    MatIcon,
    NgIf
  ],
  templateUrl: './report-2.component.html',
  styleUrl: './report-2.component.scss',
  standalone:true
})
export class Report2Component implements OnInit, OnDestroy {
  @ViewChild('revenueChart', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  public reportData!: Report2Response;
  public isLoading = true;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.fetchReportMetrics();
  }

  fetchReportMetrics(): void {
    this.reportService.getReport2Metrics().subscribe({
      next: (data: Report2Response) => {
        this.reportData = data;
        this.isLoading = false;
        this.renderChart();
      },
      error: (err) => {
        console.error('Failed to load depot revenue metrics:', err);
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
        labels: this.reportData.depots, // Dynamic depots list from database
        datasets: [
          {
            label: 'Physical Cash Vault (LKR)',
            data: this.reportData.cashAmounts, // Bound array data
            backgroundColor: '#072F32', // Corporate Deep Slate Teal
            borderColor: '#072F32',
            borderWidth: 1
          },
          {
            label: 'Digital ETM Validations (LKR)',
            data: this.reportData.digitalAmounts, // Bound array data
            backgroundColor: '#0284C7', // Clean Accent Blue
            borderColor: '#0284C7',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y', // Flipped horizontal matrix view matrix layout
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
            stacked: true,
            title: { display: true, text: 'Aggregated Revenue Tally (Rs.)', color: '#475569', font: { weight: 600 } },
            grid: { color: '#E2E8F0' },
            ticks: { color: '#64748B' }
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: { color: '#64748B', font: { size: 11, weight: 600 } }
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
