import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { ResultsComponent } from './components/results/results';
import { FavoritesComponent } from './components/favorites/favorites';
import { AboutComponent } from './components/about/about';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'results', component: ResultsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: 'home' }
];
