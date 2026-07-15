import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {MatDivider} from '@angular/material/divider';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-report-3',
  imports: [
    MatDivider,
    MatCardContent,
    MatCardSubtitle,
    MatCardTitle,
    MatCardHeader,
    MatCard
  ],
  templateUrl: './report-3.component.html',
  styleUrl: './report-3.component.scss',
  standalone:true
})
export class Report3Component implements AfterViewInit, OnDestroy{

  @ViewChild('maintenanceChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }


  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  renderChart(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
        datasets: [
          {
            label: 'Completed Vehicle Services',
            data: [65, 78, 72, 89, 85, 92, 98],
            borderColor: '#115E63', // Operational Teal
            backgroundColor: 'rgba(17, 94, 99, 0.04)',
            pointBackgroundColor: '#115E63',
            tension: 0.2, // Clean curved interpolation lines
            fill: true
          },
          {
            label: 'Pending Maintenance Backlog',
            data: [24, 28, 19, 35, 22, 14, 11],
            borderColor: '#DC2626', // Critical Warning Red
            backgroundColor: 'transparent',
            pointBackgroundColor: '#DC2626',
            tension: 0.2
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
            ticks: { color: '#64748B' }
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

}
