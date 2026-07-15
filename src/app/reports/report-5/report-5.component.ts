import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
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
  ],
  templateUrl: './report-5.component.html',
  styleUrl: './report-5.component.scss',
  standalone:true
})
export class Report5Component implements AfterViewInit, OnDestroy {
  @ViewChild('incidentPieChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Mechanical Breakdown', 'Route Deviation', 'Accident / Collision', 'E-Ticketing Machine Faults'],
        datasets: [{
          data: [45, 18, 12, 25],
          backgroundColor: [
            '#DC2626', // Mechanical Breakdown (Red Alert)
            '#D97706', // Route Deviation (Amber Warning)
            '#7F1D1D', // Accident / Collision (Deep Maroon)
            '#0284C7'  // Electronic Device Flaws (Sky Accent)
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
            position: 'right', // Fits flush alongside the pie circle inside standard material panels
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
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
