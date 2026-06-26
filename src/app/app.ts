import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('AngularUniversity');

  isDarkMode = signal<boolean>(true);
  sidebarOpen = false;

  ngOnInit() {
    const savedTheme = localStorage.getItem('angular_univ_theme');
    const dark = savedTheme !== 'light';
    this.setDarkMode(dark);
  }

  toggleTheme() {
    this.setDarkMode(!this.isDarkMode());
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  private setDarkMode(dark: boolean) {
    this.isDarkMode.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (!dark) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('angular_univ_theme', dark ? 'dark' : 'light');
  }
}
