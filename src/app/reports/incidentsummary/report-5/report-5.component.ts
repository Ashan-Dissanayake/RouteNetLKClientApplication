import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {Report5Response} from '../entity/report5response';
import {ReportService} from '../../service/reportservice';
import {NgIf} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-report-5',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatDivider,
    MatCardFooter,
    MatProgressSpinner,
    NgIf,
    MatIcon,
  ],
  templateUrl: './report-5.component.html',
  styleUrl: './report-5.component.scss',
  standalone:true
})
export class Report5Component implements OnInit, OnDestroy {
  @ViewChild('incidentPieChart', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  public reportData!: Report5Response;
  public isLoading = true;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.fetchIncidentDistribution();
  }

  fetchIncidentDistribution(): void {
    this.reportService.getReport5Metrics().subscribe({
      next: (data: Report5Response) => {
        this.reportData = data;
        this.isLoading = false;
        this.renderChart();
      },
      error: (err) => {
        console.error('Failed to load incident distribution data:', err);
        this.isLoading = false;
      }
    });
  }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.reportData.types, // Dynamic types from database
        datasets: [{
          data: this.reportData.counts, // Dynamic count metric arrays
          backgroundColor: [
            '#DC2626', // Mechanical Breakdown (Red Alert)
            '#D97706', // Route Deviation (Amber Warning)
            '#7F1D1D', // Accident / Collision (Deep Maroon)
            '#0284C7', // Electronic Device Flaws (Sky Accent)
            '#475569'  // Miscellaneous / Fallback color
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: { size: 12, weight: 500 },
              color: '#475569',
              padding: 16
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }
}
