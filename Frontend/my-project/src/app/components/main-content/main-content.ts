import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RecipeService } from '../../services/recipe-service';
import { Recipe } from '../../interfaces/recipe';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { RecipeCard } from "../recipe-card/recipe-card";

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, RecipeCard],
  templateUrl: './main-content.html',
  styleUrls: ['./main-content.css']
})
export class MainContent implements OnInit {
  private recipeService = inject(RecipeService);
  
  
  recipes = signal<Recipe[]>([]);

  filteredRecipes = computed(() => {
    const term = this.recipeService.updateSearch.toString();
    if (!term) return this.recipes();

    return this.recipes().filter(recipe => 
      recipe.title.toLowerCase().includes(term) || 
      recipe.description.toLowerCase().includes(term) ||
      recipe.difficulty.toLowerCase().includes(term)
    );
  });



  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe({
      next: (data) => this.recipes.set(data),
      error: (err) => console.error('Django Error:', err)
    });
  }
}