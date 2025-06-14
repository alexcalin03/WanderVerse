import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from core.models import BlogPost, Comment, UserTravelPreferences
from unittest.mock import patch


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user(db):
    user = User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpassword123'
    )
    return user


@pytest.fixture
def test_user_token(test_user):
    token, _ = Token.objects.get_or_create(user=test_user)
    return token


@pytest.fixture
def authenticated_client(api_client, test_user_token):
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {test_user_token}')
    return api_client


@pytest.fixture
def second_test_user(db):
    user = User.objects.create_user(
        username='testuser2',
        email='testuser2@example.com',
        password='testpassword123'
    )
    return user


@pytest.fixture
def second_user_token(second_test_user):
    token, _ = Token.objects.get_or_create(user=second_test_user)
    return token


@pytest.fixture
def second_authenticated_client(api_client, second_user_token):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {second_user_token}')
    return client


@pytest.fixture
def test_blog(test_user):
    blog = BlogPost.objects.create(
        user=test_user,
        title='Test Blog Post',
        content='This is a test blog post content.',
        location='Test City, Test Country'
    )
    return blog


@pytest.fixture
def test_comment(test_user, test_blog):
    comment = Comment.objects.create(
        user=test_user,
        blog_post=test_blog,
        content='This is a test comment.'
    )
    return comment


@pytest.fixture
def create_blog():
    def _create_blog(user, title='Blog Title', content='Blog Content', location='Test Location'):
        return BlogPost.objects.create(
            user=user,
            title=title,
            content=content,
            location=location
        )
    return _create_blog


@pytest.fixture
def create_comment():
    def _create_comment(user, blog_post, content='Test comment content'):
        return Comment.objects.create(
            user=user,
            blog_post=blog_post,
            content=content
        )
    return _create_comment


@pytest.fixture
def liked_blog(test_blog, test_user, second_test_user):
    test_blog.liked_by.add(test_user)
    test_blog.liked_by.add(second_test_user)
    return test_blog


@pytest.fixture
def user_travel_preferences(test_user):
    """Create basic travel preferences for a test user"""
    preferences, created = UserTravelPreferences.objects.get_or_create(
        user=test_user,
        defaults={
            'preferred_countries': ['FR', 'IT', 'ES'],
            'preferred_activities': ['beach', 'hiking', 'cultural'],
            'preferred_climate': 'warm',
            'preferred_budget_range': 'mid-range'
        }
    )
    
    # If preferences already existed, update them to ensure consistent test data
    if not created:
        preferences.preferred_countries = ['FR', 'IT', 'ES']
        preferences.preferred_activities = ['beach', 'hiking', 'cultural']
        preferences.preferred_climate = 'warm'
        preferences.preferred_budget_range = 'mid-range'
        preferences.save()
        
    return preferences


@pytest.fixture
def create_travel_preferences():
    """Factory fixture to create travel preferences with custom parameters"""
    def _create_preferences(user, **kwargs):
        defaults = {
            'preferred_countries': ['US', 'JP', 'AU'],
            'preferred_activities': ['city', 'food', 'shopping'],
            'preferred_climate': 'moderate',
            'preferred_budget_range': 'budget'
        }
        defaults.update(kwargs)
        preferences, created = UserTravelPreferences.objects.get_or_create(
            user=user,
            defaults=defaults
        )
        if not created:
            for key, value in defaults.items():
                setattr(preferences, key, value)
            preferences.save()
        return preferences
    return _create_preferences


@pytest.fixture
def mock_travel_suggestions():
    """Mock fixture for travel suggestions response"""
    suggestions_data = {
        "suggestions": [
            {
                "name": "Eiffel Tower",
                "city": "Paris",
                "country": "France",
                "description": "Iconic landmark with amazing views of the city",
                "image_keyword": "Eiffel Tower Paris"
            },
            {
                "name": "Colosseum",
                "city": "Rome",
                "country": "Italy",
                "description": "Ancient Roman amphitheater with rich history",
                "image_keyword": "Colosseum Rome"
            },
            {
                "name": "Sagrada Familia",
                "city": "Barcelona",
                "country": "Spain",
                "description": "Stunning basilica designed by Antoni Gaudí",
                "image_keyword": "Sagrada Familia Barcelona"
            }
        ]
    }
    return suggestions_data
