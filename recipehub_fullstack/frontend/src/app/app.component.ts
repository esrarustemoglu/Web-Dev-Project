import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  providers: [ApiService],
  template: `
    <header class="navbar">
      <div class="nav-inner">
        <a routerLink="/recipes" class="brand">🍳 RecipeHub</a>

        <nav class="nav-links">
          <a routerLink="/recipes" routerLinkActive="active">Recipes</a>
          @if (api.isLoggedIn()) {
            <a routerLink="/my-recipes" routerLinkActive="active">My Recipes</a>
            <a routerLink="/favorites" routerLinkActive="active">Favorites</a>
            <button class="btn" (click)="logout()">Logout</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active">Login</a>
            <a routerLink="/register" routerLinkActive="active">Register</a>
          }
        </nav>
      </div>
    </header>

    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  constructor(public api: ApiService, private router: Router) {}

  logout(): void {
    this.api.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.api.clearAuth();
        this.router.navigate(['/login']);
      },
    });
  }
}
