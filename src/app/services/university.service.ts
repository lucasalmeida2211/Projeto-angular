import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { University } from '../models/university.model';
import { SearchHistoryItem } from '../models/search-history.model';

@Injectable({
  providedIn: 'root',
})
export class UniversityService {
  private apiUrl = 'http://universities.hipolabs.com/search';
  private favoritesKey = 'angular_univ_favorites';
  private historyKey = 'angular_univ_history';

  private latestResults: University[] = [];
  private latestCountry: string = '';

  constructor(private http: HttpClient) {}

  searchUniversities(country: string): Observable<University[]> {
    return this.http.get<University[]>(`${this.apiUrl}?country=${encodeURIComponent(country)}`).pipe(
      tap((results) => {
        this.latestCountry = country;
        this.latestResults = results;
        this.addSearchHistory(country, results.length);
      })
    );
  }

  getLatestResults(): University[] {
    return this.latestResults;
  }

  getLatestCountry(): string {
    return this.latestCountry;
  }

  setLatestResults(results: University[], country: string) {
    this.latestResults = results;
    this.latestCountry = country;
  }

  // --- Favorites Management ---
  getFavorites(): University[] {
    const data = localStorage.getItem(this.favoritesKey);
    return data ? JSON.parse(data) : [];
  }

  isFavorite(uniName: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((u) => u.name === uniName);
  }

  toggleFavorite(uni: University): boolean {
    const favorites = this.getFavorites();
    const index = favorites.findIndex((u) => u.name === uni.name);
    let isFav = false;

    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push({ ...uni, isFavorite: true });
      isFav = true;
    }

    localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
    return isFav;
  }

  addFavorite(uni: University): void {
    const favorites = this.getFavorites();
    if (!favorites.some((u) => u.name === uni.name)) {
      favorites.push({ ...uni, isFavorite: true });
      localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
    }
  }

  removeFavorite(uniName: string): void {
    let favorites = this.getFavorites();
    favorites = favorites.filter((u) => u.name !== uniName);
    localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
  }

  // --- Search History Management ---
  getSearchHistory(): SearchHistoryItem[] {
    const data = localStorage.getItem(this.historyKey);
    return data ? JSON.parse(data) : [];
  }

  addSearchHistory(country: string, count: number): void {
    const history = this.getSearchHistory();
    
    const now = new Date();
    const formattedDate = `${this.padZero(now.getDate())}/${this.padZero(now.getMonth() + 1)}/${now.getFullYear()} ${this.padZero(now.getHours())}:${this.padZero(now.getMinutes())}:${this.padZero(now.getSeconds())}`;

    history.unshift({
      country,
      timestamp: formattedDate,
      universityCount: count,
    });

    if (history.length > 15) {
      history.pop();
    }

    localStorage.setItem(this.historyKey, JSON.stringify(history));
  }

  clearSearchHistory(): void {
    localStorage.removeItem(this.historyKey);
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
