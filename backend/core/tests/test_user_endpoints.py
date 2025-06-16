import pytest
from django.urls import reverse
from rest_framework import status
from ..models import UserTravelPreferences
from rest_framework.authtoken.models import Token


@pytest.mark.django_db
def test_user_registration(api_client):
    """Test user registration endpoint"""
    data = {
        'username': 'newuser',
        'password': 'newpassword123',
        'email': 'newuser@example.com'
    }
    
    response = api_client.post('/register/', data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert 'message' in response.data
    assert response.data['message'] == 'User created'


@pytest.mark.django_db
def test_token_auth(api_client, test_user):
    data = {
        'username': 'testuser',
        'password': 'testpassword123',
    }
    
    response = api_client.post('/api/token/', data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert 'token' in response.data


@pytest.mark.django_db
def test_logout(authenticated_client, test_user_token):
    """Test user logout endpoint"""
    assert Token.objects.filter(key=test_user_token).exists()
    
    response = authenticated_client.post('/logout/')
    assert response.status_code == status.HTTP_200_OK
    
    assert not Token.objects.filter(key=test_user_token).exists()


@pytest.mark.django_db
def test_get_current_user(authenticated_client, test_user):
    """Test getting current user profile"""
    response = authenticated_client.get('/current_user/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['username'] == test_user.username
    assert response.data['email'] == test_user.email


@pytest.mark.django_db
def test_update_user(authenticated_client, test_user):
    """Test updating user profile"""
    update_data = {
        'username': 'updated_username',
        'email': 'updated_email@example.com'
    }
    
    response = authenticated_client.patch('/update_user/', update_data, format='json')
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == 'User updated'
    
    test_user.refresh_from_db()
    assert test_user.username == 'updated_username'
    assert test_user.email == 'updated_email@example.com'


@pytest.mark.django_db
def test_update_password_success(authenticated_client, test_user):
    """Test successfully updating user password"""
    password_data = {
        'current_password': 'testpassword123',
        'new_password': 'new_secure_password456'
    }
    
    response = authenticated_client.put('/update_user_password/', password_data, format='json')
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == 'User password updated successfully'
    
    test_user.refresh_from_db()
    assert test_user.check_password('new_secure_password456')


@pytest.mark.django_db
def test_update_password_wrong_current(authenticated_client, test_user):
    """Test updating password with incorrect current password"""
    password_data = {
        'current_password': 'wrong_password',
        'new_password': 'new_secure_password456'
    }
    
    response = authenticated_client.put('/update_user_password/', password_data, format='json')
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'error' in response.data
    assert response.data['error'] == 'Current password is incorrect'
    
    test_user.refresh_from_db()
    assert test_user.check_password('testpassword123')


@pytest.mark.django_db
def test_update_password_missing_fields(authenticated_client):
    """Test updating password with missing required fields"""
    response = authenticated_client.put('/update_user_password/', {'current_password': 'testpassword123'}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    response = authenticated_client.put('/update_user_password/', {'new_password': 'new_secure_password456'}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    response = authenticated_client.put('/update_user_password/', {}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_update_travel_preferences(authenticated_client, test_user):
    """Test updating user travel preferences"""
    data = {
        'preferred_budget_range': 'luxury',
        'preferred_activities': ['hiking', 'swimming', 'sightseeing'],
        'preferred_climate': 'WARM',
        'travel_style': {'type': 'adventure', 'duration': 'long'},
        'preferred_countries': ['US', 'FR', 'IT']
    }
    
    response = authenticated_client.patch('/travel_preferences/', data, format='json')
    assert response.status_code == status.HTTP_200_OK
    
    prefs = UserTravelPreferences.objects.get(user=test_user)
    assert prefs.preferred_budget_range == 'luxury'
    assert 'hiking' in prefs.preferred_activities
    assert prefs.preferred_climate == 'WARM'
    assert prefs.travel_style['type'] == 'adventure'
