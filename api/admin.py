from django.contrib import admin

from django.contrib import admin
from .models import (
    Category, Ingredient, Recipe, RecipeIngredient,
    Rating, Comment, Favorite, UserProfile
)

admin.site.register(Category)
admin.site.register(Ingredient)
admin.site.register(Recipe)
admin.site.register(RecipeIngredient)
admin.site.register(Rating)
admin.site.register(Comment)
admin.site.register(Favorite)
admin.site.register(UserProfile)