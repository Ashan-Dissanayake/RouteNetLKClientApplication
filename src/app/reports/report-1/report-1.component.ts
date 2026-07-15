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
import {MatIcon} from '@angular/material/icon';

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
  ],
  templateUrl: './report-1.component.html',
  styleUrl: './report-1.component.scss',
  standalone:true
})
export class Report1Component implements AfterViewInit, OnDestroy{
  @ViewChild('dimensionsChart', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // Switched to AfterViewInit to guarantee the template element canvas context exists completely
  ngAfterViewInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    // Pure bar chart configuration completely bypasses the mixed-controller scale registry bug
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
          {
            label: 'Successful Trip Executions',
            data: [142, 138, 145, 120, 150, 110, 95],
            backgroundColor: '#115E63', // Operational Teal
            borderColor: '#072F32',
            borderWidth: 1
          },
          {
            label: 'Logged Breakdown Incidents',
            data: [4, 7, 2, 12, 5, 3, 1],
            backgroundColor: '#DC2626', // High-contrast Red for breakdowns
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

}
