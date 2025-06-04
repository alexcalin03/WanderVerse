from django.contrib import admin
from .models import BlogPost, Comment

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "location", "reads", "likes_count", "created_at")
    search_fields = ("title", "content", "location", "user__username")
    list_filter  = ("created_at", "location")
    prepopulated_fields = {"slug": ("title",)}   


def likes_count(self, obj):
    return obj.liked_by.count()
likes_count.short_description = "Likes"

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "blog_post", "created_at")
    search_fields = ("content", "user__username", "blog_post__title")
    list_filter  = ("created_at",)
