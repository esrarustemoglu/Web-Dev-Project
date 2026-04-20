from django.urls import path
from .views import (
    register_view, login_view, logout_view,
    category_list_view, category_recipes_view,
    RecipeListCreateAPIView, RecipeDetailAPIView,
    CommentListCreateAPIView, RatingCreateUpdateAPIView,
    FavoriteListCreateAPIView, FavoriteDeleteAPIView,
    UserProfileAPIView
)

urlpatterns = [
    path('auth/register/', register_view),
    path('auth/login/', login_view),
    path('auth/logout/', logout_view),

    path('categories/', category_list_view),
    path('categories/<int:category_id>/recipes/', category_recipes_view),

    path('recipes/', RecipeListCreateAPIView.as_view()),
    path('recipes/<int:pk>/', RecipeDetailAPIView.as_view()),

    path('recipes/<int:recipe_id>/comments/', CommentListCreateAPIView.as_view()),
    path('recipes/<int:recipe_id>/rate/', RatingCreateUpdateAPIView.as_view()),

    path('favorites/', FavoriteListCreateAPIView.as_view()),
    path('favorites/<int:recipe_id>/', FavoriteDeleteAPIView.as_view()),

    path('users/<int:user_id>/profile/', UserProfileAPIView.as_view()),
]