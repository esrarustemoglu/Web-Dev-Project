export interface Recipe {
    id: number;
    author: number;
    category: number;
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    image: string;
    video?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    prep_time: number;
    servings: number;
    created_at: string;
    updated_at: string;
}
