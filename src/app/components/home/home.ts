import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UniversityService } from '../../services/university.service';
import { SearchHistoryItem } from '../../models/search-history.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('historyChart') historyChartCanvas!: ElementRef<HTMLCanvasElement>;
  
  searchCountry = '';
  searchHistory = signal<SearchHistoryItem[]>([]);
  
  totalFavoritesCount = signal<number>(0);
  totalSearchesCount = signal<number>(0);
  mostSearchedCountry = signal<string>('Nenhum');

  popularCountries = ['Brazil', 'Canada', 'Australia', 'Germany', 'Japan'];
  isLoading = false;
  errorMessage = '';

  private chart: Chart | null = null;

  constructor(private universityService: UniversityService, private router: Router) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    this.updateChart();
  }

  loadStats() {
    const history = this.universityService.getSearchHistory();
    this.searchHistory.set(history);

    this.totalFavoritesCount.set(this.universityService.getFavorites().length);
    this.totalSearchesCount.set(history.length);

    if (history.length > 0) {
      const countryCounts: { [key: string]: number } = {};
      history.forEach((item) => {
        countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
      });

      let maxCountry = 'Nenhum';
      let maxVal = 0;
      for (const key in countryCounts) {
        if (countryCounts[key] > maxVal) {
          maxVal = countryCounts[key];
          maxCountry = key;
        }
      }
      this.mostSearchedCountry.set(`${maxCountry} (${maxVal}x)`);
    } else {
      this.mostSearchedCountry.set('Nenhum');
    }
  }

  onSearch(country: string) {
    if (!country.trim()) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.universityService.searchUniversities(country).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/results']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao consultar a API. Verifique a conexão e o nome do país.';
        console.error(err);
      }
    });
  }

  onSelectPopular(country: string) {
    this.searchCountry = country;
    this.onSearch(country);
  }

  clearHistory() {
    this.universityService.clearSearchHistory();
    this.loadStats();
    this.updateChart();
  }

  updateChart() {
    if (!this.historyChartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const history = this.searchHistory();
    if (history.length === 0) return;

    const uniqueCountries: { [key: string]: number } = {};
    [...history].reverse().forEach((item) => {
      uniqueCountries[item.country] = item.universityCount;
    });

    const labels = Object.keys(uniqueCountries);
    const data = Object.values(uniqueCountries);

    if (labels.length === 0) return;

    const ctx = this.historyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDark ? '#f8f9fa' : '#212529';
    const gridColor = isDark ? '#374151' : '#e9ecef';

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Universidades',
          data: data,
          backgroundColor: 'rgba(13, 110, 253, 0.75)',
          borderColor: '#0d6efd',
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            padding: 10,
            cornerRadius: 6,
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Outfit',
                weight: 'bold'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Outfit'
              }
            }
          }
        }
      }
    });
  }
}
