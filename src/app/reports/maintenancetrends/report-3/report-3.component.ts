import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {MatDivider} from '@angular/material/divider';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {Report3Response} from '../entity/report3response';
import {ReportService} from '../../service/reportservice';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon} from '@angular/material/icon';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-report-3',
  imports: [
    MatDivider,
    MatCardContent,
    MatCardSubtitle,
    MatCardTitle,
    MatCardHeader,
    MatCard,
    MatProgressSpinner,
    MatCardFooter,
    MatIcon,
    NgIf
  ],
  templateUrl: './report-3.component.html',
  styleUrl: './report-3.component.scss',
  standalone:true
})
export class Report3Component implements OnInit, OnDestroy {
  @ViewChild('maintenanceChart', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  public reportData!: Report3Response;
  public isLoading = true;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.fetchMaintenanceTrends();
  }

  fetchMaintenanceTrends(): void {
    this.reportService.getReport3Metrics().subscribe({
      next: (data: Report3Response) => {
        this.reportData = data;
        this.isLoading = false;
        this.renderChart();
      },
      error: (err) => {
        console.error('Failed to load maintenance lifecycle trends:', err);
        this.isLoading = false;
      }
    });
  }

  // renderChart(): void {
  //   if (this.chart) {
  //     this.chart.destroy();
  //   }
  //
  //   this.chart = new Chart(this.chartCanvas.nativeElement, {
  //     type: 'line',
  //     data: {
  //       labels: this.reportData.weeks, // Dynamic weeks mapped from API
  //       datasets: [
  //         {
  //           label: 'Completed Vehicle Services',
  //           data: this.reportData.completedServices,
  //           borderColor: '#115E63', // Operational Teal
  //           backgroundColor: 'rgba(17, 94, 99, 0.04)',
  //           pointBackgroundColor: '#115E63',
  //           tension: 0.2, // Clean curved interpolation lines
  //           fill: true
  //         },
  //         {
  //           label: 'Pending Maintenance Backlog',
  //           data: this.reportData.pendingBacklog,
  //           borderColor: '#DC2626', // Critical Warning Red
  //           backgroundColor: 'transparent',
  //           pointBackgroundColor: '#DC2626',
  //           tension: 0.2
  //         }
  //       ]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       plugins: {
  //         legend: {
  //           position: 'bottom',
  //           labels: { boxWidth: 12, font: { size: 12, weight: 500 }, color: '#475569' }
  //         }
  //       },
  //       scales: {
  //         x: {
  //           type: 'category',
  //           grid: { display: false },
  //           ticks: { color: '#64748B' }
  //         },
  //         y: {
  //           type: 'linear',
  //           beginAtZero: true,
  //           title: { display: true, text: 'Vehicle Inspections Count', color: '#475569', font: { weight: 600 } },
  //           grid: { color: '#E2E8F0' },
  //           ticks: { color: '#64748B' }
  //         }
  //       }
  //     }
  //   });
  // }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar', // Changed from 'line' to 'bar'
      data: {
        labels: this.reportData.weeks, // Dynamic weeks mapped from API
        datasets: [
          {
            label: 'Completed Vehicle Services',
            data: this.reportData.completedServices,
            backgroundColor: '#115E63', // Operational Teal
            borderRadius: 4, // Rounded bar edges
          },
          {
            label: 'Pending Maintenance Backlog',
            data: this.reportData.pendingBacklog,
            backgroundColor: '#DC2626', // Critical Warning Red
            borderRadius: 4,
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
            type: 'category',
            grid: { display: false },
            ticks: { color: '#64748B' },
            stacked: false // set true if you want stacked bars
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            title: { display: true, text: 'Vehicle Inspections Count', color: '#475569', font: { weight: 600 } },
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
