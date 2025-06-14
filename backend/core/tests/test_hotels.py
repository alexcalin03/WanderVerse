import pytest
from unittest.mock import patch
from rest_framework import status


@pytest.mark.django_db
def test_hotels_missing_city_code(api_client):
    """Test hotel search without required cityCode parameter"""
    response = api_client.get('/hotels/')
    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'Missing required parameter: cityCode' in response.json()['error']


@pytest.mark.django_db
def test_hotels_default_parameters(api_client):
    """Test hotel search with only cityCode and default parameters"""
    with patch('core.views.search_hotels') as mock_search:
        # Setup mock return data
        mock_data = {
            'data': [
                {
                    'hotel': {
                        'hotelId': 'HTPAR123',
                        'name': 'Example Paris Hotel',
                        'rating': '4'
                    },
                    'offers': [
                        {
                            'id': 'OFF123',
                            'checkInDate': '2025-11-03',
                            'checkOutDate': '2025-11-10',
                            'price': {'total': '800.00', 'currency': 'EUR'}
                        }
                    ]
                }
            ]
        }
        mock_search.return_value = mock_data
        
        # Call with only required cityCode parameter
        response = api_client.get('/hotels/', {'cityCode': 'PAR'})
        
        # Verify response
        assert response.status_code == 200
        assert 'data' in response.json()
        assert len(response.json()['data']) == 1
        assert response.json()['data'][0]['hotel']['name'] == 'Example Paris Hotel'
        
        # Check default parameters were used
        mock_search.assert_called_once_with('PAR', '2025-11-03', '2025-11-10', 1)


@pytest.mark.django_db
def test_hotels_custom_parameters(api_client):
    """Test hotel search with custom parameters"""
    with patch('core.views.search_hotels') as mock_search:
        # Setup mock return data
        mock_data = {
            'data': [
                {
                    'hotel': {
                        'hotelId': 'HTNYC456',
                        'name': 'New York Luxury Hotel',
                        'rating': '5'
                    },
                    'offers': [
                        {
                            'id': 'OFF456',
                            'checkInDate': '2025-12-24',
                            'checkOutDate': '2025-12-31',
                            'price': {'total': '1200.00', 'currency': 'USD'},
                            'guests': {'adults': 2}
                        }
                    ]
                }
            ]
        }
        mock_search.return_value = mock_data
        
        # Call with custom parameters
        response = api_client.get(
            '/hotels/',
            {
                'cityCode': 'NYC',
                'checkInDate': '2025-12-24',
                'checkOutDate': '2025-12-31',
                'adults': 2
            }
        )
        
        # Verify response
        assert response.status_code == 200
        assert 'data' in response.json()
        assert response.json()['data'][0]['hotel']['name'] == 'New York Luxury Hotel'
        
        # Note: URL parameters are always strings, even for numeric values
        mock_search.assert_called_once_with('NYC', '2025-12-24', '2025-12-31', '2')


@pytest.mark.django_db
def test_hotels_error_response(api_client):
    """Test hotel search error handling"""
    with patch('core.views.search_hotels') as mock_search:
        # Setup error response
        error_response = {'error': 'No hotels found for the specified city code'}
        mock_search.return_value = error_response
        
        response = api_client.get('/hotels/', {'cityCode': 'XYZ'})
        
        # Verify error handling
        assert response.status_code == 400
        assert 'error' in response.json()
        assert 'Invalid hotel search data' in response.json()['error']
        assert response.json()['details'] == 'No hotels found for the specified city code'


@pytest.mark.django_db
def test_hotels_empty_results(api_client):
    """Test hotel search with empty results"""
    with patch('core.views.search_hotels') as mock_search:
        # Setup empty response
        mock_data = {'data': []}
        mock_search.return_value = mock_data
        
        response = api_client.get('/hotels/', {'cityCode': 'ZRH'})
        
        # Verify response with empty data
        assert response.status_code == 200
        assert 'data' in response.json()
        assert response.json()['data'] == []


@pytest.mark.django_db
def test_hotels_with_authenticated_user(authenticated_client):
    """Test hotel search with authenticated user"""
    with patch('core.views.search_hotels') as mock_search:
        # Setup mock return data
        mock_data = {
            'data': [
                {
                    'hotel': {'name': 'Test Hotel'},
                    'offers': [{'price': {'total': '500.00'}}]
                }
            ]
        }
        mock_search.return_value = mock_data
        
        response = authenticated_client.get('/hotels/', {'cityCode': 'LON'})
        
        # Verify authenticated access works
        assert response.status_code == 200
        assert 'data' in response.json()
