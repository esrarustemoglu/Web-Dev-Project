import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthResponse } from '../models/user';
import { Category } from '../models/category';
import { CommentItem, IngredientRow, Recipe } from '../models/recipe';

@Injectable()
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api';
  readonly currentUser = signal<string | null>(localStorage.getItem('username'));

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }

  clearAuth(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    this.currentUser.set(null);
  }

  saveAuth(data: AuthResponse): void {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('username', data.user.username);
    this.currentUser.set(data.user.username);
  }

  login(payload: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login/`, payload).pipe(
      tap((data) => this.saveAuth(data)),
      catchError(this.handleError)
    );
  }

  register(payload: { username: string; email: string; password: string; password2: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register/`, payload).pipe(
      tap((data) => this.saveAuth(data)),
      catchError(this.handleError)
    );
  }

  logout(): Observable<unknown> {
    const refresh = localStorage.getItem('refresh') || '';
    return this.http.post(`${this.baseUrl}/auth/logout/`, { refresh }).pipe(
      tap(() => this.clearAuth()),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`).pipe(catchError(this.handleError));
  }

  seedCategories(): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.baseUrl}/categories/seed/`, {}).pipe(catchError(this.handleError));
  }

  getRecipes(filters?: { search?: string; category?: string; ordering?: string; mine?: boolean }): Observable<Recipe[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.ordering) params = params.set('ordering', filters.ordering);
    if (filters?.mine) params = params.set('mine', 'true');

    return this.http.get<Recipe[]>(`${this.baseUrl}/recipes/`, { params }).pipe(catchError(this.handleError));
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/recipes/${id}/`).pipe(catchError(this.handleError));
  }

  createRecipe(formValue: {
    category_id: number;
    title: string;
    description: string;
    instructions: string;
    difficulty: string;
    prep_time_minutes: number;
    servings: number;
    ingredients_payload: IngredientRow[];
    imageFile?: File | null;
    videoFile?: File | null;
  }): Observable<Recipe> {
    const formData = new FormData();
    formData.append('category_id', String(formValue.category_id));
    formData.append('title', formValue.title);
    formData.append('description', formValue.description);
    formData.append('instructions', formValue.instructions);
    formData.append('difficulty', formValue.difficulty);
    formData.append('prep_time_minutes', String(formValue.prep_time_minutes));
    formData.append('servings', String(formValue.servings));
    formData.append('ingredients_payload', JSON.stringify(formValue.ingredients_payload || []));
    if (formValue.imageFile) formData.append('image', formValue.imageFile);
    if (formValue.videoFile) formData.append('video', formValue.videoFile);

    return this.http.post<Recipe>(`${this.baseUrl}/recipes/`, formData).pipe(catchError(this.handleError));
  }

  deleteRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recipes/${id}/`).pipe(catchError(this.handleError));
  }

  addFavorite(recipeId: number): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.baseUrl}/favorites/`, { recipe_id: recipeId }).pipe(catchError(this.handleError));
  }

  removeFavorite(recipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/favorites/${recipeId}/`).pipe(catchError(this.handleError));
  }

  getFavorites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/favorites/`).pipe(catchError(this.handleError));
  }

  rateRecipe(recipeId: number, value: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/recipes/${recipeId}/rate/`, { value }).pipe(catchError(this.handleError));
  }

  getComments(recipeId: number): Observable<CommentItem[]> {
    return this.http.get<CommentItem[]>(`${this.baseUrl}/recipes/${recipeId}/comments/`).pipe(catchError(this.handleError));
  }

  addComment(recipeId: number, text: string, imageFile?: File | null): Observable<CommentItem> {
    const formData = new FormData();
    formData.append('text', text);
    if (imageFile) formData.append('image', imageFile);
    return this.http.post<CommentItem>(`${this.baseUrl}/recipes/${recipeId}/comments/`, formData).pipe(catchError(this.handleError));
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile/`).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let message = 'Something went wrong. Please try again.';
    if (error?.error?.detail) {
      message = error.error.detail;
    } else if (typeof error?.error === 'object' && error?.error) {
      const firstKey = Object.keys(error.error)[0];
      const value = error.error[firstKey];
      message = Array.isArray(value) ? value[0] : String(value);
    }
    return throwError(() => new Error(message));
  }
}
