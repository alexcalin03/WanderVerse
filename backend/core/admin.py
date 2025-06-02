from django.contrib import admin
from .models import BlogPost, Comment

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "location", "reads", "likes", "created_at")
    search_fields = ("title", "content", "location", "user__username")
    list_filter  = ("created_at", "location")
    prepopulated_fields = {"slug": ("title",)}   # auto‐fill slug based on title

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "blog_post", "created_at")
    search_fields = ("content", "user__username", "blog_post__title")
    list_filter  = ("created_at",)
