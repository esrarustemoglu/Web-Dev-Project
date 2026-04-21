from django.urls import path

from .views import (
    CategoryListAPIView,
    FavoriteDeleteAPIView,
    FavoriteListCreateAPIView,
    LoginAPIView,
    ProfileAPIView,
    RecipeDetailAPIView,
    RecipeListCreateAPIView,
    SeedCategoriesAPIView,
    logout_view,
    rate_recipe,
    recipe_comments,
    register_view,
)

urlpatterns = [
    path('auth/register/', register_view),
    path('auth/login/', LoginAPIView.as_view()),
    path('auth/logout/', logout_view),

    path('categories/', CategoryListAPIView.as_view()),
    path('categories/seed/', SeedCategoriesAPIView.as_view()),

    path('recipes/', RecipeListCreateAPIView.as_view()),
    path('recipes/<int:recipe_id>/', RecipeDetailAPIView.as_view()),
    path('recipes/<int:recipe_id>/rate/', rate_recipe),
    path('recipes/<int:recipe_id>/comments/', recipe_comments),

    path('favorites/', FavoriteListCreateAPIView.as_view()),
    path('favorites/<int:recipe_id>/', FavoriteDeleteAPIView.as_view()),

    path('profile/', ProfileAPIView.as_view()),
    path('profiles/<str:username>/', ProfileAPIView.as_view()),
]
