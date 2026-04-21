import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Saved favorites</h1>
      <p class="muted">Your personal shortlist of recipes worth coming back to.</p>
    </section>

    @if (errorMessage) {
      <div class="error">{{ errorMessage }}</div>
    }

    <section class="grid grid-2">
      @for (favorite of favorites; track favorite.id) {
        <article class="card recipe-card">
          @if (favorite.recipe.image) {
            <img class="recipe-img" [src]="favorite.recipe.image" [alt]="favorite.recipe.title">
          }
          <h3 style="margin:0;">{{ favorite.recipe.title }}</h3>
          <p class="muted">{{ favorite.recipe.description }}</p>
          <div class="row">
            <a class="btn primary" [routerLink]="['/recipes', favorite.recipe.id]">Open</a>
            <button class="btn" (click)="remove(favorite.recipe.id)">Remove</button>
          </div>
        </article>
      } @empty {
        <div class="card">No favorites yet.</div>
      }
    </section>
  `,
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.api.getFavorites().subscribe({
      next: (data) => (this.favorites = data),
      error: (error) => (this.errorMessage = error.message),
    });
  }

  remove(recipeId: number): void {
    this.api.removeFavorite(recipeId).subscribe({
      next: () => this.loadFavorites(),
      error: (error) => (this.errorMessage = error.message),
    });
  }
}
