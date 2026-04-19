import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recipe } from '../../interfaces/recipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.css',
})
export class RecipeCard {
  recipe = input.required<Recipe>();
}
