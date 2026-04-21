import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CommentItem, Recipe } from '../models/recipe';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (recipe) {
      <section class="grid grid-2">
        <article class="card">
          @if (recipe.image) {
            <img class="recipe-img" [src]="recipe.image" [alt]="recipe.title" style="height: 300px;">
          }

          <div class="row space-between" style="margin-top: 16px;">
            <div>
              <h1 style="margin:0;">{{ recipe.title }}</h1>
              <p class="muted">by {{ recipe.author_username }}</p>
            </div>
            <span class="chip">{{ recipe.difficulty }} · ⭐ {{ recipe.average_rating }}</span>
          </div>

          <div class="separator"></div>

          <p>{{ recipe.description }}</p>
          <p class="muted small">Prep: {{ recipe.prep_time_minutes }} min · Servings: {{ recipe.servings }} · Views: {{ recipe.views_count }}</p>

          <h3>Ingredients</h3>
          <div class="form-grid">
            @for (item of recipe.recipe_ingredients; track item.id) {
              <div class="row">
                <span class="chip">{{ item.ingredient.name }}</span>
                <span>{{ item.quantity }} {{ item.unit }}</span>
              </div>
            } @empty {
              <p class="muted">No ingredients added yet.</p>
            }
          </div>

          <h3 style="margin-top:20px;">Instructions</h3>
          <p style="white-space: pre-line;">{{ recipe.instructions }}</p>

          @if (recipe.video) {
            <div style="margin-top: 16px;">
              <a class="btn" [href]="recipe.video" target="_blank">Open video</a>
            </div>
          }
        </article>

        <article class="card">
          <h2>Rate this recipe</h2>
          @if (errorMessage) {
            <div class="error">{{ errorMessage }}</div>
          }
          @if (message) {
            <div class="success-box">{{ message }}</div>
          }

          <div class="row" style="margin-bottom: 18px;">
            <select class="input" [(ngModel)]="ratingValue" name="ratingValue" style="max-width:180px;">
              <option [ngValue]="1">1 star</option>
              <option [ngValue]="2">2 stars</option>
              <option [ngValue]="3">3 stars</option>
              <option [ngValue]="4">4 stars</option>
              <option [ngValue]="5">5 stars</option>
            </select>
            <button class="btn primary" (click)="submitRating()">Submit rating</button>
          </div>

          <h2>Add comment</h2>
          <div class="form-grid">
            <textarea [(ngModel)]="commentText" name="commentText" placeholder="Share your cooking result or tips..."></textarea>
            <input class="input" type="file" accept="image/*" (change)="onCommentImageChange($event)">
            <button class="btn success" (click)="submitComment()">Post comment</button>
          </div>

          <div class="separator"></div>

          <h2>Comments</h2>
          <div class="form-grid">
            @for (comment of comments; track comment.id) {
              <div class="card" style="padding: 14px;">
                <div class="row space-between">
                  <strong>{{ comment.user.username }}</strong>
                  <span class="muted small">{{ comment.created_at.substring(0, 10) }}</span>
                </div>
                <p>{{ comment.text }}</p>
                @if (comment.image) {
                  <img class="recipe-img" [src]="comment.image" alt="comment image" style="height: 180px;">
                }
              </div>
            } @empty {
              <p class="muted">No comments yet. Be the first one.</p>
            }
          </div>
        </article>
      </section>
    } @else {
      <div class="card">Loading recipe...</div>
    }
  `,
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  comments: CommentItem[] = [];
  ratingValue = 5;
  commentText = '';
  commentImageFile: File | null = null;
  errorMessage = '';
  message = '';

  constructor(private route: ActivatedRoute, public api: ApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRecipe(id);
    this.loadComments(id);
  }

  loadRecipe(id: number): void {
    this.api.getRecipe(id).subscribe({
      next: (data) => (this.recipe = data),
      error: (error) => (this.errorMessage = error.message),
    });
  }

  loadComments(id: number): void {
    this.api.getComments(id).subscribe({
      next: (data) => (this.comments = data),
      error: (error) => (this.errorMessage = error.message),
    });
  }

  submitRating(): void {
    if (!this.recipe) return;
    this.api.rateRecipe(this.recipe.id, this.ratingValue).subscribe({
      next: () => {
        this.message = 'Rating saved.';
        this.loadRecipe(this.recipe!.id);
      },
      error: (error) => (this.errorMessage = error.message),
    });
  }

  onCommentImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.commentImageFile = input.files?.[0] || null;
  }

  submitComment(): void {
    if (!this.recipe) return;
    this.message = '';
    this.api.addComment(this.recipe.id, this.commentText, this.commentImageFile).subscribe({
      next: () => {
        this.message = 'Comment posted.';
        this.commentText = '';
        this.commentImageFile = null;
        this.loadComments(this.recipe!.id);
      },
      error: (error) => (this.errorMessage = error.message),
    });
  }
}
