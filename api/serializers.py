from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    Category, Recipe, Ingredient, RecipeIngredient,
    Rating, Comment, Favorite, UserProfile
)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'


class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'quantity', 'unit']


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'recipe', 'text', 'image', 'created_at']
        read_only_fields = ['user', 'created_at']


class RatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'recipe', 'score']
        read_only_fields = ['user']


class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'recipe', 'recipe_title', 'created_at']
        read_only_fields = ['user', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'avatar', 'bio']


class RecipeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            'id', 'user', 'category', 'title', 'description', 'instructions',
            'difficulty', 'prep_time', 'servings', 'photo', 'video',
            'views_count', 'is_published', 'created_at',
            'average_rating', 'comments_count'
        ]
        read_only_fields = ['user', 'views_count', 'created_at']

    def get_average_rating(self, obj):
        return obj.average_rating()

    def get_comments_count(self, obj):
        return obj.comments.count()