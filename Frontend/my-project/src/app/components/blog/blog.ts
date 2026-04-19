import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../services/recipe-service';
import { Recipe } from '../../interfaces/recipe';

@Component({
  selector: 'app-blog',
  imports: [],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit{
  recipes: Recipe[] = [];
  isLoading: boolean = true;

  constructor(private recipeService: RecipeService){}

  ngOnInit(){
    this.loadRecipes();
  }

  loadRecipes(){
    this.recipeService.getRecipes().subscribe((data) => {
      this.recipes = data;
      this.isLoading = false;
    } );
  }
  onDelete(id: number){
    this.recipeService.deleteRecipe(id).subscribe(() => {
      this.recipes = this.recipes.filter(r => r.id !== id);
    });
  }
}
