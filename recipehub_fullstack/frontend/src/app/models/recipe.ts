import { Category } from './category';

export interface IngredientRow {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface ReadIngredientRow {
  id: number;
  ingredient: {
    id: number;
    name: string;
    default_unit: string;
  };
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: number;
  author_username: string;
  category: Category | null;
  title: string;
  description: string;
  instructions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time_minutes: number;
  servings: number;
  image: string | null;
  video: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  average_rating: number;
  is_favorite: boolean;
  recipe_ingredients: ReadIngredientRow[];
}

export interface CommentItem {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  recipe: number;
  text: string;
  image: string | null;
  created_at: string;
}
