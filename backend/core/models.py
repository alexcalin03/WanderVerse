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
    liked_by = models.ManyToManyField(User, related_name='liked_posts', blank=True)

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

    @property
    def likes_count(self):
        return self.liked_by.count()


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return (self.content[:47] + "...") if len(self.content) > 50 else self.content


class UserTravelPreferences(models.Model):
    """
    Stores user travel preferences including preferred countries to visit
    and other travel-related settings
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='travel_preferences')
    
    # Country preferences
    preferred_countries = models.JSONField(
        default=list,
        help_text="List of country codes the user prefers to visit"
    )
    
    # Travel preferences
    preferred_activities = models.JSONField(
        default=list, 
        blank=True,
        help_text="Types of activities the user enjoys (e.g., 'beach', 'hiking', 'city')"
    )
    preferred_climate = models.CharField(
        max_length=50, 
        blank=True, 
        help_text="User's climate preference (e.g., 'warm', 'cold', 'tropical')"
    )
    preferred_budget_range = models.CharField(
        max_length=20, 
        blank=True, 
        help_text="User's typical travel budget range (e.g., 'budget', 'mid-range', 'luxury')"
    )
    
    # Travel style
    travel_style = models.JSONField(
        default=dict,
        blank=True,
        help_text="User's travel preferences like accommodation type, trip duration, etc."
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Travel Preferences"
    
    class Meta:
        verbose_name = "User Travel Preferences"
        verbose_name_plural = "User Travel Preferences"
