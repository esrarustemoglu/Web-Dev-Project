import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../interfaces/recipe';
import { Comment } from '../interfaces/comment';
import { Favorite } from '../interfaces/favorite';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  
  searchQuery = signal<string>('');

  updateSearch(query: string) {
    this.searchQuery.set(query);
  }
  private apiUrl = "http://localhost:8000/api";

  constructor(private http: HttpClient) {}

  getRecipes(): Observable<Recipe[]>{
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/`);
  }

  createRecipe(recipeData: any): Observable<Recipe[]>{
    return this.http.post<Recipe[]>(`${this.apiUrl}/recipes/`, recipeData);
  }

  addComment(commentData: Partial<Comment>): Observable<Comment[]>{
    return this.http.post<Comment[]>(`${this.apiUrl}/comments/`, commentData);
  }

  deleteRecipe(id: number): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/recipes/${id}/`);
  }
}
