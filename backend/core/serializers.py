from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BlogPost, Comment, UserTravelPreferences

class BlogPostCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=200,
        trim_whitespace=True,
        help_text="Required. 200 characters or fewer."
    )

    user = serializers.CharField(source='user.username',
        read_only=True
    )
    content = serializers.CharField(
        allow_blank=False,
        trim_whitespace=False,
        help_text="Required."
    )
    location = serializers.CharField(
        max_length=200,
        trim_whitespace=True,
        help_text="Required. 200 characters or fewer."
    )

    class Meta:
        model = BlogPost
        fields = ['title', 'user', 'content', 'location']

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        return value

    def validate_location(self, value):
        if ',' not in value:
            raise serializers.ValidationError("Location must include a comma (e.g. 'City, Country').")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        return BlogPost.objects.create(user=user, **validated_data)


class BlogPostListSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='user.username', read_only=True)
    excerpt = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id',
            'slug',
            'title',
            'excerpt',
            'location',
            'author_username',
            'reads',
            'likes_count',
            'is_liked',
            'created_at',
        ]

    def get_excerpt(self, obj):
        # show the first 100 characters of content
        text = obj.content or ''
        return text[:100] + '...' if len(text) > 100 else text

    def get_likes_count(self, obj):
        return obj.liked_by.count()

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.liked_by.filter(pk=user.pk).exists()
        return False



class CommentCreateSerializer(serializers.ModelSerializer):

    content = serializers.CharField(
        allow_blank=False,
        trim_whitespace=False,
        help_text="Required."
    )
    author_username = serializers.CharField(source='user.username', read_only=True)
    id = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author_username', 'created_at', 'updated_at']

    def validate_content(self, value):
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Content must be at least 1 character long.")
        return value

    

    def create(self, validated_data):
        user = self.context['request'].user
        blog_post = self.context['blog_post']
        return Comment.objects.create(user=user, blog_post=blog_post, **validated_data)


class UserTravelPreferencesSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserTravelPreferences
        fields = ['id', 'username', 'preferred_countries', 'preferred_activities', 
                  'preferred_climate', 'preferred_budget_range', 'travel_style', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'username', 'created_at', 'updated_at']
