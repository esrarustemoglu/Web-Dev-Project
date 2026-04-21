import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="grid grid-2">
      <div class="hero">
        <h1>Welcome back to RecipeHub</h1>
        <p class="muted">
          Login to publish recipes, rate dishes, drop comments, and save favorites.
        </p>
      </div>

      <div class="card">
        <h2>Login</h2>

        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }

        <div class="form-grid">
          <input class="input" [(ngModel)]="username" name="username" placeholder="Username">
          <input class="input" [(ngModel)]="password" name="password" type="password" placeholder="Password">
          <button class="btn primary" (click)="login()">Login</button>
          <a routerLink="/register" class="muted small">No account yet? Register here.</a>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  login(): void {
    this.errorMessage = '';
    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (error) => (this.errorMessage = error.message),
    });
  }
}
