from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils.crypto import get_random_string

class BlogPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True, help_text="URL-friendly identifier")
    content = models.TextField()
    location = models.CharField(max_length=200)
    
    reads = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:200]
            slug_candidate = base_slug
            num = 1
            while BlogPost.objects.filter(slug=slug_candidate).exists():
                slug_candidate = f"{base_slug[: (200 - len(str(num)) - 1 ) ]}-{num}"
                num += 1
            self.slug = slug_candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (self.content[:47] + "...") if len(self.content) > 50 else self.content
