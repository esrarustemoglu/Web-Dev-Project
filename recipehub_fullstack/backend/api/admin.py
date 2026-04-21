from django.contrib import admin
from .models import Category, Comment, Favorite, Ingredient, Rating, Recipe, RecipeIngredient, UserProfile

admin.site.register(UserProfile)
admin.site.register(Category)
admin.site.register(Ingredient)
admin.site.register(Recipe)
admin.site.register(RecipeIngredient)
admin.site.register(Rating)
admin.site.register(Comment)
admin.site.register(Favorite)
