import { Component } from '@angular/core';
import { Category } from '../../interfaces/category';
import { Comment } from '../../interfaces/comment';
import { Favorite } from '../../interfaces/favorite';
import { Profile } from '../../interfaces/profile';
import { Rating } from '../../interfaces/rating';
import { Recipe } from '../../interfaces/recipe';
import { MainContent } from '../main-content/main-content';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MainContent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  
}
