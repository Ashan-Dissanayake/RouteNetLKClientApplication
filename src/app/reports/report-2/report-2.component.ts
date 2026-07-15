import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-report-2',
  imports: [
    MatCardTitle,
    MatCard,
    MatCardSubtitle,
    MatCardContent,
    MatDivider,
    MatCardHeader
  ],
  templateUrl: './report-2.component.html',
  styleUrl: './report-2.component.scss',
  standalone:true
})
export class Report2Component implements AfterViewInit, OnDestroy{

  @ViewChild('revenueChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
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
      type: 'bar',
      data: {
        labels: ['Colombo', 'Kandy Depot', 'Galle Depot', 'Anuradhapura', 'Jaffna Depot'],
        datasets: [
          {
            label: 'Physical Cash Vault (LKR)',
            data: [320000, 285000, 192500, 115000, 145000],
            backgroundColor: '#072F32', // Corporate Deep Slate Teal
            borderColor: '#072F32',
            borderWidth: 1
          },
          {
            label: 'Digital ETM Validations (LKR)',
            data: [640000, 240000, 115000, 98000, 210000],
            backgroundColor: '#0284C7', // Clean Accent Blue
            borderColor: '#0284C7',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y', // CRITICAL: Flips the chart to a horizontal matrix view
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

}
