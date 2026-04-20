import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { RecipeService } from '../../services/recipe-service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private recipeService = inject(RecipeService);

  onSearch(term: string) {
    this.recipeService.updateSearch(term);
  }
  public authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
  }
}
