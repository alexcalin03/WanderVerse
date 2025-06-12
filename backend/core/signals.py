from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserTravelPreferences

@receiver(post_save, sender=User)
def create_user_travel_preferences(sender, instance, created, **kwargs):
    """
    Signal to automatically create UserTravelPreferences when a new User is created
    """
    if created:
        UserTravelPreferences.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_travel_preferences(sender, instance, **kwargs):
    """
    Signal to save UserTravelPreferences when User is updated
    """
    # Create travel preferences if they don't exist
    if not hasattr(instance, 'travel_preferences'):
        UserTravelPreferences.objects.create(user=instance)
    else:
        instance.travel_preferences.save()
