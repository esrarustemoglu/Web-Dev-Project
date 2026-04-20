from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Recipe, Rating, Comment, Favorite, UserProfile
from .serializers import (
    RegisterSerializer, LoginSerializer, CategorySerializer,
    RecipeSerializer, RatingSerializer, CommentSerializer,
    FavoriteSerializer, UserProfileSerializer
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# auth fbv

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'User registered successfully',
            'user_id': user.id,
            'username': user.username,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if user is not None:
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful',
                'access': tokens['access'],
                'refresh': tokens['refresh']
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


# category fbv

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def category_list_view(request):
    categories = Category.objects.all().order_by('id')
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def category_recipes_view(request, category_id):
    recipes = Recipe.objects.filter(category_id=category_id).order_by('-created_at')
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)




class RecipeListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        recipes = Recipe.objects.all().order_by('-created_at')

        search = request.GET.get('search')
        category = request.GET.get('category')
        difficulty = request.GET.get('difficulty')
        sort = request.GET.get('sort')

        if search:
            recipes = recipes.filter(title__icontains=search)

        if category:
            recipes = recipes.filter(category_id=category)

        if difficulty:
            recipes = recipes.filter(difficulty=difficulty)

        if sort == 'rating':
            recipes = sorted(recipes, key=lambda x: x.average_rating(), reverse=True)
            serializer = RecipeSerializer(recipes, many=True, context={'request': request})
            return Response(serializer.data)

        serializer = RecipeSerializer(recipes, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = RecipeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecipeDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Recipe.objects.get(pk=pk)
        except Recipe.DoesNotExist:
            return None

    def get(self, request, pk):
        recipe = self.get_object(pk)
        if not recipe:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

        recipe.views_count += 1
        recipe.save()

        serializer = RecipeSerializer(recipe, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        recipe = self.get_object(pk)
        if not recipe:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

        if recipe.user != request.user:
            return Response({'error': 'You can edit only your own recipes'}, status=status.HTTP_403_FORBIDDEN)

        serializer = RecipeSerializer(recipe, data=request.data, partial=False, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        recipe = self.get_object(pk)
        if not recipe:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

        if recipe.user != request.user:
            return Response({'error': 'You can edit only your own recipes'}, status=status.HTTP_403_FORBIDDEN)

        serializer = RecipeSerializer(recipe, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        recipe = self.get_object(pk)
        if not recipe:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

        if recipe.user != request.user:
            return Response({'error': 'You can delete only your own recipes'}, status=status.HTTP_403_FORBIDDEN)

        recipe.delete()
        return Response({'message': 'Recipe deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# ---------------- COMMENTS ----------------

class CommentListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, recipe_id):
        comments = Comment.objects.filter(recipe_id=recipe_id).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, recipe_id):
        data = request.data.copy()
        data['recipe'] = recipe_id
        serializer = CommentSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# rating

class RatingCreateUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, recipe_id):
        score = request.data.get('score')

        if not score:
            return Response({'error': 'Score is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            score = int(score)
        except ValueError:
            return Response({'error': 'Score must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        if score < 1 or score > 5:
            return Response({'error': 'Score must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)

        rating, created = Rating.objects.update_or_create(
            user=request.user,
            recipe_id=recipe_id,
            defaults={'score': score}
        )

        serializer = RatingSerializer(rating)
        return Response(
            {
                'message': 'Rating created' if created else 'Rating updated',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


# favs

class FavoriteListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user).order_by('-created_at')
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    def post(self, request):
        recipe_id = request.data.get('recipe')
        if not recipe_id:
            return Response({'error': 'Recipe id is required'}, status=status.HTTP_400_BAD_REQUEST)

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            recipe_id=recipe_id
        )

        serializer = FavoriteSerializer(favorite)
        return Response(
            {
                'message': 'Added to favorites' if created else 'Already in favorites',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class FavoriteDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, recipe_id):
        try:
            favorite = Favorite.objects.get(user=request.user, recipe_id=recipe_id)
            favorite.delete()
            return Response({'message': 'Removed from favorites'}, status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response({'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)


# usr folders

class UserProfileAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        try:
            profile = UserProfile.objects.get(user_id=user_id)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserProfileSerializer(profile, context={'request': request})
        user_recipes = Recipe.objects.filter(user_id=user_id).order_by('-created_at')
        recipes_serializer = RecipeSerializer(user_recipes, many=True, context={'request': request})

        return Response({
            'profile': serializer.data,
            'recipes': recipes_serializer.data
        })