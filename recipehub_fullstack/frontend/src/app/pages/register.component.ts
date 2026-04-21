import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="grid grid-2">
      <div class="hero">
        <h1>Create your RecipeHub account</h1>
        <p class="muted">
          Share your recipes, build your profile, and save the dishes you actually want to cook.
        </p>
      </div>

      <div class="card">
        <h2>Register</h2>

        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }

        <div class="form-grid">
          <input class="input" [(ngModel)]="username" name="username" placeholder="Username">
          <input class="input" [(ngModel)]="email" name="email" placeholder="Email">
          <input class="input" [(ngModel)]="password" name="password" type="password" placeholder="Password">
          <input class="input" [(ngModel)]="password2" name="password2" type="password" placeholder="Repeat password">
          <button class="btn primary" (click)="register()">Create account</button>
          <a routerLink="/login" class="muted small">Already registered? Login here.</a>
        </div>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  password2 = '';
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  register(): void {
    this.errorMessage = '';
    this.api.register({
      username: this.username,
      email: this.email,
      password: this.password,
      password2: this.password2,
    }).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (error) => (this.errorMessage = error.message),
    });
  }
}
