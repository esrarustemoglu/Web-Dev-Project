import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Category } from '../models/category';
import { IngredientRow, Recipe } from '../models/recipe';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="grid grid-2">
      <article class="card">
        <h1>Create a recipe</h1>

        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }
        @if (message) {
          <div class="success-box">{{ message }}</div>
        }

        <div class="form-grid">
          <input class="input" [(ngModel)]="title" name="title" placeholder="Recipe title">
          <textarea [(ngModel)]="description" name="description" placeholder="Short description"></textarea>
          <textarea [(ngModel)]="instructions" name="instructions" placeholder="Step-by-step instructions"></textarea>

          <div class="form-grid two">
            <select class="input" [(ngModel)]="categoryId" name="categoryId">
              <option [ngValue]="0">Choose category</option>
              @for (category of categories; track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>

            <select class="input" [(ngModel)]="difficulty" name="difficulty">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <input class="input" [(ngModel)]="prepTimeMinutes" name="prepTimeMinutes" type="number" placeholder="Prep time in minutes">
            <input class="input" [(ngModel)]="servings" name="servings" type="number" placeholder="Servings">
          </div>

          <textarea
            [(ngModel)]="ingredientsText"
            name="ingredientsText"
            placeholder="Ingredients format: name|quantity|unit
Flour|2|cups
Sugar|1|cup"></textarea>

          <input class="input" type="file" accept="image/*" (change)="onImageChange($event)">
          <input class="input" type="file" accept="video/*" (change)="onVideoChange($event)">

          <button class="btn primary" (click)="createRecipe()">Publish recipe</button>
        </div>
      </article>

      <article class="card">
        <h1>My recipes</h1>

        <div class="form-grid">
          @for (recipe of recipes; track recipe.id) {
            <div class="card" style="padding: 14px;">
              <div class="row space-between">
                <div>
                  <strong>{{ recipe.title }}</strong>
                  <div class="muted small">{{ recipe.category?.name || 'No category' }} · ⭐ {{ recipe.average_rating }}</div>
                </div>
                <button class="btn" (click)="deleteRecipe(recipe.id)">Delete</button>
              </div>
            </div>
          } @empty {
            <p class="muted">You have not created any recipes yet.</p>
          }
        </div>
      </article>
    </section>
  `,
})
export class MyRecipesComponent implements OnInit {
  categories: Category[] = [];
  recipes: Recipe[] = [];

  title = '';
  description = '';
  instructions = '';
  categoryId = 0;
  difficulty = 'easy';
  prepTimeMinutes = 30;
  servings = 2;
  ingredientsText = '';

  imageFile: File | null = null;
  videoFile: File | null = null;

  errorMessage = '';
  message = '';

  constructor(private api: ApiService) {}

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
    this.api.getRecipes({ mine: true }).subscribe({
      next: (data) => (this.recipes = data),
      error: (error) => (this.errorMessage = error.message),
    });
  }

  parseIngredients(): IngredientRow[] {
    return this.ingredientsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [ingredient_name, quantity, unit] = line.split('|');
        return {
          ingredient_name: (ingredient_name || '').trim(),
          quantity: Number(quantity || '1'),
          unit: (unit || 'pcs').trim(),
        };
      });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFile = input.files?.[0] || null;
  }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoFile = input.files?.[0] || null;
  }

  createRecipe(): void {
    this.errorMessage = '';
    this.message = '';

    this.api.createRecipe({
      category_id: this.categoryId,
      title: this.title,
      description: this.description,
      instructions: this.instructions,
      difficulty: this.difficulty,
      prep_time_minutes: this.prepTimeMinutes,
      servings: this.servings,
      ingredients_payload: this.parseIngredients(),
      imageFile: this.imageFile,
      videoFile: this.videoFile,
    }).subscribe({
      next: () => {
        this.message = 'Recipe created successfully.';
        this.title = '';
        this.description = '';
        this.instructions = '';
        this.ingredientsText = '';
        this.imageFile = null;
        this.videoFile = null;
        this.loadRecipes();
      },
      error: (error) => (this.errorMessage = error.message),
    });
  }

  deleteRecipe(id: number): void {
    this.api.deleteRecipe(id).subscribe({
      next: () => {
        this.message = 'Recipe deleted.';
        this.loadRecipes();
      },
      error: (error) => (this.errorMessage = error.message),
    });
  }
}
