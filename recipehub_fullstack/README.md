# RecipeHub Full-Stack Project

This package contains a Django REST Framework backend and an Angular standalone frontend that together satisfy the RecipeHub assignment requirements.

## What is included

### Backend
- 8 models: `Category`, `Recipe`, `Ingredient`, `RecipeIngredient`, `Rating`, `Comment`, `Favorite`, `UserProfile`
- 2+ ForeignKey relationships
- Custom queryset/manager pattern on `Recipe`
- 2 serializers from `serializers.Serializer`: `RegisterSerializer`, `LoginSerializer`
- 2+ serializers from `serializers.ModelSerializer`
- 2+ FBVs: register, logout, rate recipe, recipe comments
- 2+ CBVs using `APIView`
- JWT auth with login/register/logout
- Full CRUD for recipes
- `request.user` ownership on created recipes/comments/ratings/favorites
- CORS configured for Angular dev server

### Frontend
- Standalone Angular app
- Routing with 5 routes
- `@for` and `@if`
- `[(ngModel)]` controls across login/register/search/create recipe forms
- JWT interceptor
- HttpClient service for API calls
- Multiple click events that trigger API requests
- Basic responsive styling
- Graceful API error messages

### Extras
- Postman collection included in `postman/RecipeHub.postman_collection.json`

## Run the backend

```bash
cd backend
python -m venv venv
# macOS/Linux
source venv/bin/activate
# Windows
# venv\Scripts\activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Open another terminal and optionally seed starter categories:

```bash
curl -X POST http://127.0.0.1:8000/api/categories/seed/
```

## Run the frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:4200` and backend on `http://127.0.0.1:8000`.

## Suggested demo flow for defence

1. Register a new user
2. Login
3. Seed categories
4. Create a recipe with ingredients and image/video
5. Open recipe details
6. Rate the recipe
7. Add a comment with image
8. Save recipe to favorites
9. Open "My Recipes"
10. Delete a recipe

## Important note

This is a full scaffold intended to be directly usable, but you still need to:
- install dependencies
- run migrations
- add media files during testing
- commit it to your repo
