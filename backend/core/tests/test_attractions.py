import pytest
from unittest.mock import patch
from rest_framework import status
from django.http import JsonResponse


@pytest.mark.django_db
def test_attractions_no_parameters(api_client):
    # Test when no parameters are provided
    response = api_client.get('/attractions/')
    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'Missing required parameters' in response.json()['error']


@pytest.mark.django_db
def test_attractions_missing_longitude(api_client):
    # Test with only latitude provided
    response = api_client.get('/attractions/', {'latitude': '48.8566'})
    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'Missing required parameters' in response.json()['error']


@pytest.mark.django_db
def test_attractions_missing_latitude(api_client):
    # Test with only longitude provided
    response = api_client.get('/attractions/', {'longitude': '2.3522'})
    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'Missing required parameters' in response.json()['error']


@pytest.mark.django_db
@patch('core.views.search_attractions')  # Patch the import as used in views.py
def test_attractions_success(mock_search, api_client):
    # Setup mock return data - match the actual response structure
    mock_data = [
        {
            'booking_link': 'https://example.com/tour1',
            'currency': 'EUR',
            'image': 'https://example.com/image1.jpg',
            'latitude': 48.8584,
            'longitude': 2.2945,
            'name': 'Eiffel Tower Tour',
            'price': 25.0
        },
        {
            'booking_link': 'https://example.com/tour2',
            'currency': 'EUR',
            'image': 'https://example.com/image2.jpg',
            'latitude': 48.8606,
            'longitude': 2.3376,
            'name': 'Louvre Museum Tour',
            'price': 30.0
        }
    ]
    mock_search.return_value = mock_data
    
    response = api_client.get('/attractions/', {'latitude': '48.8566', 'longitude': '2.3522'})
    
    # Verify response
    assert response.status_code == 200
    response_data = response.json()
    assert isinstance(response_data, list)
    assert len(response_data) == 2
    assert response_data[0]['name'] == 'Eiffel Tower Tour'
    assert response_data[1]['name'] == 'Louvre Museum Tour'
    
    # Verify mock was called with correct parameters
    mock_search.assert_called_once_with('48.8566', '2.3522')


@pytest.mark.django_db
@patch('core.views.search_attractions')  # Patch the import as used in views.py
def test_attractions_service_error(mock_search, api_client):
    # Setup error response
    error_response = {'error': 'API rate limit exceeded'}
    mock_search.return_value = error_response
    
    response = api_client.get('/attractions/', {'latitude': '48.8566', 'longitude': '2.3522'})
    
    # The API returns a 400 status when there's an error
    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'Invalid attractions search data' in response.json()['error']


@pytest.mark.django_db
@patch('core.views.search_attractions')  # Patch the import as used in views.py
def test_attractions_with_authenticated_user(mock_search, authenticated_client):
    # Setup empty list return value
    mock_data = []
    mock_search.return_value = mock_data
    
    response = authenticated_client.get('/attractions/', {'latitude': '48.8566', 'longitude': '2.3522'})
    
    # Verify response success
    assert response.status_code == 200
    assert response.json() == []  # Empty list returned
