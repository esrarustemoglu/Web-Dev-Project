from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Avg, Q
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Comment, Favorite, Rating, Recipe
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    FavoriteSerializer,
    LoginSerializer,
    RatingSerializer,
    RecipeSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    build_auth_response,
)


@api_view(['POST'])
@parser_classes([JSONParser])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(build_auth_response(user), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        RefreshToken(refresh_token).blacklist()
    except Exception:
        return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'detail': 'Logged out successfully.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_recipe(request, recipe_id):
    try:
        recipe = Recipe.objects.get(pk=recipe_id)
    except Recipe.DoesNotExist:
        return Response({'detail': 'Recipe not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = RatingSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    rating, _ = Rating.objects.update_or_create(
        user=request.user,
        recipe=recipe,
        defaults={'value': serializer.validated_data['value']},
    )
    return Response(RatingSerializer(rating).data)


@api_view(['GET', 'POST'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def recipe_comments(request, recipe_id):
    try:
        recipe = Recipe.objects.get(pk=recipe_id)
    except Recipe.DoesNotExist:
        return Response({'detail': 'Recipe not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = recipe.comments.select_related('user').order_by('-created_at')
        return Response(CommentSerializer(comments, many=True, context={'request': request}).data)

    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = CommentSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user, recipe=recipe)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    parser_classes = [JSONParser]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
        )
        if not user:
            return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(build_auth_response(user))


class CategoryListAPIView(APIView):
    def get(self, request):
        categories = Category.objects.order_by('name')
        return Response(CategorySerializer(categories, many=True).data)


class RecipeListCreateAPIView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        recipes = Recipe.objects.select_related('author', 'category').prefetch_related(
            'recipe_ingredients__ingredient',
            'ratings',
            'favorites',
        )

        search = request.query_params.get('search')
        category_id = request.query_params.get('category')
        ordering = request.query_params.get('ordering', 'newest')
        mine = request.query_params.get('mine')

        if search:
            recipes = recipes.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
                | Q(recipe_ingredients__ingredient__name__icontains=search)
            ).distinct()

        if category_id:
            recipes = recipes.filter(category_id=category_id)

        if mine == 'true' and request.user.is_authenticated:
            recipes = recipes.filter(author=request.user)

        if ordering == 'highest_rated':
            recipes = recipes.annotate(avg_rating=Avg('ratings__value')).order_by('-avg_rating', '-created_at')
        elif ordering == 'oldest':
            recipes = recipes.order_by('created_at')
        else:
            recipes = recipes.order_by('-created_at')

        serializer = RecipeSerializer(recipes, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = RecipeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RecipeDetailAPIView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_object(self, recipe_id):
        return Recipe.objects.select_related('author', 'category').prefetch_related(
            'recipe_ingredients__ingredient',
            'ratings',
            'favorites',
        ).get(pk=recipe_id)

    def get(self, request, recipe_id):
        try:
            recipe = self.get_object(recipe_id)
        except Recipe.DoesNotExist:
            return Response({'detail': 'Recipe not found.'}, status=status.HTTP_404_NOT_FOUND)
        recipe.views_count += 1
        recipe.save(update_fields=['views_count'])
        return Response(RecipeSerializer(recipe, context={'request': request}).data)

    def patch(self, request, recipe_id):
        try:
            recipe = self.get_object(recipe_id)
        except Recipe.DoesNotExist:
            return Response({'detail': 'Recipe not found.'}, status=status.HTTP_404_NOT_FOUND)

        if recipe.author != request.user:
            return Response({'detail': 'You can edit only your own recipe.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = RecipeSerializer(recipe, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request, recipe_id):
        return self.patch(request, recipe_id)

    def delete(self, request, recipe_id):
        try:
            recipe = self.get_object(recipe_id)
        except Recipe.DoesNotExist:
            return Response({'detail': 'Recipe not found.'}, status=status.HTTP_404_NOT_FOUND)

        if recipe.author != request.user:
            return Response({'detail': 'You can delete only your own recipe.'}, status=status.HTTP_403_FORBIDDEN)

        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user).select_related(
            'recipe',
            'recipe__author',
            'recipe__category',
        )
        return Response(FavoriteSerializer(favorites, many=True, context={'request': request}).data)

    def post(self, request):
        recipe_id = request.data.get('recipe_id')
        if not recipe_id:
            return Response({'detail': 'recipe_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recipe = Recipe.objects.get(pk=recipe_id)
        except Recipe.DoesNotExist:
            return Response({'detail': 'Recipe not found.'}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(user=request.user, recipe=recipe)
        message = 'Added to favorites.' if created else 'Already in favorites.'
        return Response({'detail': message, 'favorite_id': favorite.id})


class FavoriteDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, recipe_id):
        deleted, _ = Favorite.objects.filter(user=request.user, recipe_id=recipe_id).delete()
        if not deleted:
            return Response({'detail': 'Favorite not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username=None):
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
            user = request.user

        profile_data = UserProfileSerializer(user.profile, context={'request': request}).data
        recipes = Recipe.objects.filter(author=user).order_by('-created_at')
        recipes_data = RecipeSerializer(recipes, many=True, context={'request': request}).data

        return Response({
            'profile': profile_data,
            'recipes': recipes_data,
        })


class SeedCategoriesAPIView(APIView):
    def post(self, request):
        if Category.objects.exists():
            return Response({'detail': 'Categories already exist.'})

        defaults = [
            {'name': 'Italian', 'icon': '🍝', 'description': 'Pasta, pizza, and comfort classics.'},
            {'name': 'Asian', 'icon': '🥢', 'description': 'Noodles, rice dishes, and bold flavors.'},
            {'name': 'Dessert', 'icon': '🍰', 'description': 'Cakes, cookies, and sweet recipes.'},
            {'name': 'Healthy', 'icon': '🥗', 'description': 'Fresh, balanced meals and snacks.'},
        ]
        for item in defaults:
            Category.objects.create(**item)
        return Response({'detail': 'Default categories created.'}, status=status.HTTP_201_CREATED)
