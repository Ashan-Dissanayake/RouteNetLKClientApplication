import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {
  MatDatepicker, MatDatepickerInput, MatDatepickerToggle, MatDateRangeInput, MatDateRangePicker, MatEndDate
} from '@angular/material/datepicker';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-report-4',
  imports: [
    MatCardSubtitle,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatDateRangeInput,
    MatLabel,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatFormField,
    FormsModule,
    MatEndDate,
    MatCardContent,
    MatDivider,
    MatInput,
    MatDatepicker,
    MatDatepickerInput
  ],
  templateUrl: './report-4.component.html',
  styleUrl: './report-4.component.scss',
  standalone:true
})
export class Report4Component implements AfterViewInit, OnDestroy{
  @ViewChild('dynamicPerformanceChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  // Single raw date selector property
  public selectedDate = new Date(2026, 6, 12);

  ngAfterViewInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jul 01', 'Jul 03', 'Jul 05', 'Jul 07', 'Jul 09', 'Jul 11', 'Jul 12'],
        datasets: [
          {
            label: 'Aggregated Passenger Count',
            data: [4200, 4800, 5100, 3900, 5600, 6100, 5800],
            borderColor: '#0284C7',
            backgroundColor: 'rgba(2, 132, 199, 0.05)',
            tension: 0.2,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Distance Traveled (KM)',
            data: [1800, 1950, 2100, 1650, 2300, 2450, 2200],
            borderColor: '#115E63',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, color: '#475569' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748B' } },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Total Passenger Journeys', color: '#475569' },
            grid: { color: '#E2E8F0' },
            ticks: { color: '#64748B' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Effective Mileage (KM)', color: '#475569' },
            grid: { drawOnChartArea: false },
            ticks: { color: '#64748B' }
          }
        }
      }
    });
  }

  onDateChanged(): void {
    if (this.selectedDate) {
      console.log(`Querying tripexecution database aggregates for day: ${this.selectedDate.toDateString()}`);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

}
