import json
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Comment, Favorite, Ingredient, Rating, Recipe, RecipeIngredient, UserProfile


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'Username already exists.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'bio', 'avatar']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'description']


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'default_unit']


class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'quantity', 'unit']


class RecipeSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    category = CategorySerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    recipe_ingredients = serializers.SerializerMethodField()
    ingredients_payload = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = Recipe
        fields = [
            'id',
            'author_username',
            'category',
            'category_id',
            'title',
            'description',
            'instructions',
            'difficulty',
            'prep_time_minutes',
            'servings',
            'image',
            'video',
            'views_count',
            'created_at',
            'updated_at',
            'average_rating',
            'is_favorite',
            'recipe_ingredients',
            'ingredients_payload',
        ]
        read_only_fields = ['views_count', 'created_at', 'updated_at']

    def get_average_rating(self, obj):
        return obj.average_rating_value

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Favorite.objects.filter(user=request.user, recipe=obj).exists()

    def get_recipe_ingredients(self, obj):
        items = obj.recipe_ingredients.select_related('ingredient').all()
        return RecipeIngredientSerializer(items, many=True).data

    def _parse_ingredients_payload(self, ingredients_payload):
        if not ingredients_payload:
            return []
        if isinstance(ingredients_payload, str):
            try:
                ingredients_payload = json.loads(ingredients_payload)
            except json.JSONDecodeError as exc:
                raise serializers.ValidationError({'ingredients_payload': 'Invalid JSON for ingredients.'}) from exc
        if not isinstance(ingredients_payload, list):
            raise serializers.ValidationError({'ingredients_payload': 'Must be a list.'})
        return ingredients_payload

    def _save_ingredients(self, recipe, ingredients_payload):
        recipe.recipe_ingredients.all().delete()
        for item in ingredients_payload:
            ingredient_name = item.get('ingredient_name', '').strip()
            if not ingredient_name:
                continue
            ingredient, _ = Ingredient.objects.get_or_create(
                name=ingredient_name,
                defaults={'default_unit': item.get('unit', '')}
            )
            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=ingredient,
                quantity=item.get('quantity', 1),
                unit=item.get('unit', ingredient.default_unit or 'pcs')
            )

    def create(self, validated_data):
        ingredients_payload = self._parse_ingredients_payload(validated_data.pop('ingredients_payload', []))
        request = self.context['request']
        recipe = Recipe.objects.create(author=request.user, **validated_data)
        self._save_ingredients(recipe, ingredients_payload)
        return recipe

    def update(self, instance, validated_data):
        ingredients_payload = validated_data.pop('ingredients_payload', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if ingredients_payload is not None:
            self._save_ingredients(instance, self._parse_ingredients_payload(ingredients_payload))
        return instance


class RatingSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'recipe', 'value', 'created_at']
        read_only_fields = ['user', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'recipe', 'text', 'image', 'created_at']
        read_only_fields = ['user', 'recipe', 'created_at']


class FavoriteSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'recipe', 'created_at']


def build_auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'user': UserMiniSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
