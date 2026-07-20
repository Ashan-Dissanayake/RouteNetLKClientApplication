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
import {
  MatDatepicker,
  MatDatepickerInput, MatDatepickerModule,
  MatDatepickerToggle,
  MatDatepickerToggleIcon,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate
} from '@angular/material/datepicker';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';
import {Report4Response} from '../entity/report4response';
import {ReportService} from '../../service/reportservice';
import {NgIf} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatNativeDateModule, provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-report-4',
  imports: [
    MatCardSubtitle,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatDateRangeInput,
    MatLabel,
    MatSuffix,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatFormField,
    FormsModule,
    MatEndDate,
    MatCardContent,
    MatDivider,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatProgressSpinner,
    MatCardFooter,
    MatIcon,
    ReactiveFormsModule,
    NgIf,
    MatIconButton,
    MatDatepickerToggleIcon,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './report-4.component.html',
  styleUrl: './report-4.component.scss',
  standalone:true,
  providers: [provideNativeDateAdapter()],

})
export class Report4Component implements OnInit, OnDestroy {
  @ViewChild('dynamicPerformanceChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  public reportData!: Report4Response;
  public isLoading = false; // Start as false since user has to pick dates first

  // Validation bounds: e.g., Max date is today to prevent picking future dates
  public minDate = new Date(2020, 0, 1);
  public maxDate = new Date();

  // Clean, empty initialization requiring explicit user input with Validators
  public range = new FormGroup({
    start: new FormControl<Date | null>(null, [Validators.required]),
    end: new FormControl<Date | null>(null, [Validators.required])
  });

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    // Left intentionally empty to wait for user interaction, bypassing the freeze loop
  }

  fetchPerformanceMetrics(): void {
    const start = this.range.get('start')?.value;
    const end = this.range.get('end')?.value;

    // Safety fallback: if either endpoint is missing, ensure spinner is dead and break
    if (!start || !end) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.reportService.getReport4Metrics(start, end).subscribe({
      next: (data: Report4Response) => {
        this.reportData = data;
        this.isLoading = false;

        // Push rendering to the next macro-task so the DOM has time to paint the canvas element
        setTimeout(() => {
          this.renderChart();
        }, 0);
      },
      error: (err) => {
        console.error('Operational metrics fetch failed:', err);
        this.isLoading = false; // Prevents frozen loading spinner loops on bad network responses
      }
    });
  }

  onDateRangeChanged(): void {
    const start = this.range.get('start')?.value;
    const end = this.range.get('end')?.value;

    // Fire the Spring Boot request only when a full bounding box is selected
    if (start && end) {
      this.fetchPerformanceMetrics();
    }
  }

  renderChart(): void {
    if (!this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.reportData.logDates,
        datasets: [
          {
            label: 'Aggregated Passenger Count',
            data: this.reportData.totalPassengers,
            borderColor: '#0284C7',
            backgroundColor: 'rgba(2, 132, 199, 0.05)',
            tension: 0.2,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Distance Traveled (KM)',
            data: this.reportData.totalDistances,
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
            title: { display: true, text: 'Total Passenger Journeys', color: '#475569', font: { weight: 600 } },
            grid: { color: '#E2E8F0' },
            ticks: { color: '#64748B' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Effective Mileage (KM)', color: '#475569', font: { weight: 600 } },
            grid: { drawOnChartArea: false },
            ticks: { color: '#64748B' }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }
}
