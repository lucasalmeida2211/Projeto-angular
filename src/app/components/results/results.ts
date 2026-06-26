import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UniversityService } from '../../services/university.service';
import { University } from '../../models/university.model';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './results.html',
})
export class ResultsComponent implements OnInit {
  countryName = signal<string>('');
  rawUniversities = signal<University[]>([]);
  filterTerm = signal<string>('');
  sortOrder = signal<'asc' | 'desc'>('asc');

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  protected readonly Math = Math;

  constructor(private universityService: UniversityService) {}

  ngOnInit() {
    this.loadResults();
  }

  loadResults() {
    const country = this.universityService.getLatestCountry();
    const results = this.universityService.getLatestResults();
    
    this.countryName.set(country);
    this.rawUniversities.set(results);
    this.currentPage.set(1);
  }

  // --- Statistical Dashboard (Calculated on RAW results) ---
  totalCount = computed(() => this.rawUniversities().length);
  
  uniqueDomainsCount = computed(() => {
    const domainsSet = new Set<string>();
    this.rawUniversities().forEach((uni) => {
      if (uni.domains) {
        uni.domains.forEach((d) => domainsSet.add(d.toLowerCase().trim()));
      }
    });
    return domainsSet.size;
  });

  favoritesCountInResults = computed(() => {
    const favorites = this.universityService.getFavorites();
    const favoriteNames = new Set(favorites.map((f) => f.name));
    return this.rawUniversities().filter((uni) => favoriteNames.has(uni.name)).length;
  });

  // --- Filtered and Sorted list ---
  processedUniversities = computed(() => {
    let list = [...this.rawUniversities()];
    const term = this.filterTerm().toLowerCase().trim();

    if (term) {
      list = list.filter((uni) => uni.name.toLowerCase().includes(term));
    }

    list.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (this.sortOrder() === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    return list;
  });

  // --- Paginated list ---
  paginatedUniversities = computed(() => {
    const list = this.processedUniversities();
    const startIdx = (this.currentPage() - 1) * this.itemsPerPage();
    const endIdx = startIdx + this.itemsPerPage();
    return list.slice(startIdx, endIdx);
  });

  totalPages = computed(() => {
    const count = this.processedUniversities().length;
    const pages = Math.ceil(count / this.itemsPerPage());
    return pages > 0 ? pages : 1;
  });

  toggleFavorite(uni: University) {
    this.universityService.toggleFavorite(uni);
    
    this.rawUniversities.update((list) =>
      list.map((u) => {
        if (u.name === uni.name) {
          return { ...u, isFavorite: !u.isFavorite };
        }
        return u;
      })
    );
  }

  isFavorite(uni: University): boolean {
    return this.universityService.isFavorite(uni.name);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onItemsPerPageChange() {
    this.currentPage.set(1);
  }

  onFilterChange() {
    this.currentPage.set(1);
  }

  setSortOrder(order: 'asc' | 'desc') {
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }
}
