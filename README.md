# Web-Dev-Project
# RecipeHub - Social Recipe Sharing Platform

## Project Description

RecipeHub is a full-stack web application built with Angular and Django REST Framework that serves as a social platform for food enthusiasts to share, discover, and interact with recipes. Users can create accounts, share their own recipes with photos and videos, rate recipes from other users, leave comments with images, and build their personal recipe collections.

### Core Features

User Authentication & Profiles
- Secure JWT-based authentication (login/register/logout)
- Personalized user profiles with avatars and bio information
- Each user has their own recipe collection and activity history

Recipe Management
- Create, read, update, and delete recipes
- Upload recipe photos and instructional videos
- Add detailed ingredients with quantities and units
- Step-by-step cooking instructions
- Categorize recipes by cuisine type
- Set difficulty level, preparation time, and serving size

Search & Discovery
- Search bar – Search recipes by title, ingredients, or description
- Category filtering – Browse recipes by cuisine categories
- Rating sorting – Sort recipes by highest rated
- Dynamic filtering system for easy recipe discovery

Interactive Features
- Rating system – Rate recipes from 1 to 5 stars
- Comments section – Leave feedback on recipes
- Photo comments – Upload images when commenting on recipes
- Video support – Add cooking videos to your recipes
- Save to favorites – Bookmark recipes for later

Social Elements
- View other users' profiles and their published recipes
- Track recipe views count
- See average ratings for each recipe
- Engage with the community through comments and ratings

### Technical Stack

Frontend (Angular)
- Angular 17+ with standalone components
- Reactive forms with validation
- HTTP interceptors for JWT authentication
- Responsive CSS styling
- Lazy loading modules
- Real-time search functionality

Backend (Django REST Framework)
- Django 5.0 with Django REST Framework
- JWT token authentication
- 7+ database models with relationships
- Function-Based Views and Class-Based Views
- Custom serializers for complex data structures
- Image and video file upload handling
- CORS configuration for secure cross-origin requests

### Database Models

1. Category – Recipe categories with icons and descriptions
2. Recipe – Main recipe entity with all cooking details
3. Ingredient – Individual ingredient items
4. RecipeIngredient – Junction table linking recipes to ingredients
5. Rating – User ratings for recipes (1-5 stars)
6. Comment – User comments with optional images
7. Favorite – Saved recipes per user
8. UserProfile – Extended user profile information

### API Endpoints

- Authentication – Register, login, logout
- Recipes – Full CRUD operations for recipes
- Ratings – Create and update recipe ratings
- Comments – Add and view comments on recipes
- Favorites – Save and manage favorite recipes
- Categories – List all recipe categories
- Users – View user profiles and their recipes

### Project Goals

This project demonstrates proficiency in:
- Full-stack web development with modern frameworks
- RESTful API design and implementation
- Secure authentication and authorization
- File upload handling (images and videos)
- Complex database relationships
- Responsive frontend design
- Error handling and user feedback
- Code organization and best practices

---

Group Members:
- Rustemoglu Esra Zhibek
- Askarbekkyzy Akzhainak
- Urmanova Samira 
