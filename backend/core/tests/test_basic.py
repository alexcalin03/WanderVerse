import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User

@pytest.mark.django_db
def test_register_user():
    """Test that a user can be registered"""
    client = APIClient()
    url = reverse('register_user')
    data = {
        'username': 'testuser',
        'password': 'testpassword123',
        'email': 'test@example.com'
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 201
    assert User.objects.filter(username='testuser').exists()

@pytest.mark.django_db
def test_login_endpoint():
    """Test that a user can get an auth token"""
    # Create a test user first
    User.objects.create_user(username='logintest', password='password123')
    
    client = APIClient()
    response = client.post(
        '/api/token/', 
        {'username': 'logintest', 'password': 'password123'}, 
        format='json'
    )
    assert response.status_code == 200
    assert 'token' in response.data
