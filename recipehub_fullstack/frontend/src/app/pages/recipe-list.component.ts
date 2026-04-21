import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Category } from '../models/category';
import { Recipe } from '../models/recipe';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="hero">
      <h1>Discover recipes without the boring part</h1>
      <p class="muted">
        Search by title or ingredient, filter by category, and sort by rating to find the good stuff fast.
      </p>
    </section>

    <section class="card">
      <div class="form-grid two">
        <input class="input" [(ngModel)]="search" name="search" placeholder="Search by title, category, ingredient...">
        <select class="input" [(ngModel)]="selectedCategory" name="selectedCategory">
          <option value="">All categories</option>
          @for (category of categories; track category.id) {
            <option [value]="category.id">{{ category.icon }} {{ category.name }}</option>
          }
        </select>

        <select class="input" [(ngModel)]="ordering" name="ordering">
          <option value="newest">Newest first</option>
          <option value="highest_rated">Highest rated</option>
          <option value="oldest">Oldest first</option>
        </select>

        <button class="btn primary" (click)="loadRecipes()">Search recipes</button>
      </div>

      <div class="row" style="margin-top: 14px;">
        <button class="btn" (click)="seedCategories()">Seed categories</button>
        <span class="muted small">Handy when the database is empty right after migration.</span>
      </div>

      @if (message) {
        <div class="success-box" style="margin-top: 14px;">{{ message }}</div>
      }

      @if (errorMessage) {
        <div class="error" style="margin-top: 14px;">{{ errorMessage }}</div>
      }
    </section>

    <section class="grid grid-2" style="margin-top: 20px;">
      @for (recipe of recipes; track recipe.id) {
        <article class="card recipe-card">
          @if (recipe.image) {
            <img class="recipe-img" [src]="recipe.image" [alt]="recipe.title">
          } @else {
            <div class="recipe-img row" style="justify-content:center;">No image yet</div>
          }

          <div class="row space-between">
            <span class="chip">{{ recipe.category?.icon || '🍽️' }} {{ recipe.category?.name || 'No category' }}</span>
            <span class="muted small">⭐ {{ recipe.average_rating }} · {{ recipe.views_count }} views</span>
          </div>

          <div>
            <h3 style="margin: 0 0 8px;">{{ recipe.title }}</h3>
            <p class="muted">{{ recipe.description }}</p>
          </div>

          <div class="row small muted">
            <span>by {{ recipe.author_username }}</span>
            <span>•</span>
            <span>{{ recipe.prep_time_minutes }} min</span>
            <span>•</span>
            <span>{{ recipe.servings }} servings</span>
          </div>

          <div class="row">
            <a class="btn primary" [routerLink]="['/recipes', recipe.id]">Open details</a>
            @if (api.isLoggedIn()) {
              <button class="btn" (click)="toggleFavorite(recipe)">
                {{ recipe.is_favorite ? 'Remove favorite' : 'Save favorite' }}
              </button>
            }
          </div>
        </article>
      } @empty {
        <div class="card">No recipes found. Try another search or seed sample categories first.</div>
      }
    </section>
  `,
})
export class RecipeListComponent implements OnInit {
  categories: Category[] = [];
  recipes: Recipe[] = [];
  search = '';
  selectedCategory = '';
  ordering = 'newest';
  errorMessage = '';
  message = '';

  constructor(public api: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadRecipes();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (error) => (this.errorMessage = error.message),
    });
  }

  loadRecipes(): void {
    this.errorMessage = '';
    this.message = '';
    this.api.getRecipes({
      search: this.search,
      category: this.selectedCategory,
      ordering: this.ordering,
    }).subscribe({
      next: (data) => (this.recipes = data),
      error: (error) => (this.errorMessage = error.message),
    });
  }

  seedCategories(): void {
    this.api.seedCategories().subscribe({
      next: (data) => {
        this.message = data.detail;
        this.loadCategories();
      },
      error: (error) => (this.errorMessage = error.message),
    });
  }

  toggleFavorite(recipe: Recipe): void {
    const action = recipe.is_favorite ? this.api.removeFavorite(recipe.id) : this.api.addFavorite(recipe.id);
    action.subscribe({
      next: () => this.loadRecipes(),
      error: (error) => (this.errorMessage = error.message),
    });
  }
}
