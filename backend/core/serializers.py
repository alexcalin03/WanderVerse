from rest_framework import serializers
from .models import BlogPost, Comment

class BlogPostCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=200,
        trim_whitespace=True,
        help_text="Required. 200 characters or fewer."
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
        fields = ['title', 'content', 'location']

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


class CommentCreateSerializer(serializers.ModelSerializer):

    content = serializers.CharField(
        allow_blank=False,
        trim_whitespace=False,
        help_text="Required."
    )


    class Meta:
        model = Comment
        fields = ['content']

    def validate_content(self, value):
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Content must be at least 1 character long.")
        return value

    

    def create(self, validated_data):
        user = self.context['request'].user
        blog_post = self.context['blog_post']
        return Comment.objects.create(user=user, blog_post=blog_post, **validated_data)

