import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UniversityService } from '../../services/university.service';
import { University } from '../../models/university.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './favorites.html',
})
export class FavoritesComponent implements OnInit {
  favorites = signal<University[]>([]);
  filterTerm = signal<string>('');

  protected readonly Math = Math;

  constructor(private universityService: UniversityService) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favorites.set(this.universityService.getFavorites());
  }

  // --- Statistics ---
  totalFavoritesCount = computed(() => this.favorites().length);

  uniqueDomainsCount = computed(() => {
    const domainsSet = new Set<string>();
    this.favorites().forEach((uni) => {
      if (uni.domains) {
        uni.domains.forEach((d) => domainsSet.add(d.toLowerCase().trim()));
      }
    });
    return domainsSet.size;
  });

  // --- Filtered favorites ---
  filteredFavorites = computed(() => {
    const term = this.filterTerm().toLowerCase().trim();
    if (!term) return this.favorites();
    return this.favorites().filter((uni) => uni.name.toLowerCase().includes(term));
  });

  // --- Remove favorite ---
  removeFavorite(uniName: string) {
    this.universityService.removeFavorite(uniName);
    this.loadFavorites();
  }
}
