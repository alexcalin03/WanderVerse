import pytest
from unittest.mock import patch
from rest_framework import status


@pytest.mark.django_db
def test_flights_default_parameters(api_client):
    """Test flight search with default parameters"""
    with patch('core.views.search_flights') as mock_search:
        # Setup mock return data
        mock_data = {
            'data': [
                {
                    'id': 'FL1234',
                    'origin': 'MAD',
                    'destination': 'ATH',
                    'departureDate': '2025-03-03',
                    'price': {'total': '120.00', 'currency': 'EUR'},
                    'airlines': ['IB']
                }
            ]
        }
        mock_search.return_value = mock_data
        
        # Call without parameters should use defaults
        response = api_client.get('/flights/')
        
        # Verify response
        assert response.status_code == 200
        assert 'data' in response.json()
        
        # Check default parameters were used
        mock_search.assert_called_once_with('MAD', 'ATH', '2025-03-03', None, 1)


@pytest.mark.django_db
def test_flights_custom_parameters(api_client):
    """Test flight search with custom parameters"""
    with patch('core.views.search_flights') as mock_search:
        # Setup mock return data
        mock_data = {
            'data': [
                {
                    'id': 'FL5678',
                    'origin': 'JFK',
                    'destination': 'LAX',
                    'departureDate': '2025-06-15',
                    'returnDate': '2025-06-22',
                    'price': {'total': '350.00', 'currency': 'USD'},
                    'airlines': ['AA']
                }
            ]
        }
        mock_search.return_value = mock_data
        
        # Call with custom parameters
        response = api_client.get(
            '/flights/',
            {
                'origin': 'JFK',
                'destination': 'LAX',
                'departureDate': '2025-06-15',
                'returnDate': '2025-06-22',
                'adults': 2
            }
        )
        
        # Verify response
        assert response.status_code == 200
        assert 'data' in response.json()
        
        # Check custom parameters were used
        # Note: URL parameters are always strings, even for numeric values
        mock_search.assert_called_once_with('JFK', 'LAX', '2025-06-15', '2025-06-22', '2')


@pytest.mark.django_db
def test_flights_error_response(api_client):
    """Test flight search error handling"""
    with patch('core.views.search_flights') as mock_search:
        # Setup error response
        error_response = {'error': 'No flights found for the specified route'}
        mock_search.return_value = error_response
        
        response = api_client.get('/flights/', {'origin': 'AAA', 'destination': 'ZZZ'})
        
        # Verify error handling
        assert response.status_code == 400
        assert 'error' in response.json()
        assert 'Invalid travel data' in response.json()['error']
        assert response.json()['details'] == 'No flights found for the specified route'


@pytest.mark.django_db
def test_flights_empty_results(api_client):
    """Test flight search with empty results"""
    with patch('core.views.search_flights') as mock_search:
        # Setup empty response
        mock_data = {'data': []}
        mock_search.return_value = mock_data
        
        response = api_client.get('/flights/')
        
        # Verify response with empty data
        assert response.status_code == 200
        assert 'data' in response.json()
        assert response.json()['data'] == []


@pytest.mark.django_db
def test_flights_with_authenticated_user(authenticated_client):
    """Test flight search with authenticated user"""
    with patch('core.views.search_flights') as mock_search:
        # Setup mock return data
        mock_data = {'data': [{'id': 'FL1234', 'price': {'total': '250.00'}}]}
        mock_search.return_value = mock_data
        
        response = authenticated_client.get('/flights/')
        
        # Verify authenticated access works
        assert response.status_code == 200
        assert 'data' in response.json()


@pytest.mark.django_db
def test_airport_autocomplete_success(api_client):
    """Test airport autocomplete with valid query"""
    with patch('core.views.search_airports') as mock_search:
        # Setup mock return data for airports
        mock_data = [
            {
                "airport_name": "Madrid Barajas International Airport",
                "iata_code": "MAD",
                "city_name": "Madrid"
            },
            {
                "airport_name": "Adolfo Suárez Madrid–Barajas Airport",
                "iata_code": "MAD",
                "city_name": "Madrid"
            }
        ]
        mock_search.return_value = mock_data
        
        # Call with query parameter
        response = api_client.get('/airports/', {'query': 'Madrid'})
        
        # Verify response
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert response.json()[0]['iata_code'] == 'MAD'


@pytest.mark.django_db
def test_airport_autocomplete_no_query(api_client):
    """Test airport autocomplete with missing query parameter"""
    # Call without query parameter
    response = api_client.get('/airports/')
    
    # Verify error response
    assert response.status_code == 400
    assert 'error' in response.json()
    assert response.json()['error'] == 'No query provided'


@pytest.mark.django_db
def test_city_autocomplete_success(api_client):
    """Test city autocomplete with valid query"""
    with patch('core.views.search_cities') as mock_search:
        # Setup mock return data for cities
        mock_data = [
            {
                "city_name": "Paris",
                "iata_code": "PAR",
                "country_name": "France",
                "latitude": 48.856614,
                "longitude": 2.352222
            },
            {
                "city_name": "Parisian Region",
                "iata_code": "XHP",
                "country_name": "France",
                "latitude": 48.858844,
                "longitude": 2.394293
            }
        ]
        mock_search.return_value = mock_data
        
        # Call with query parameter
        response = api_client.get('/cities/', {'query': 'Paris'})
        
        # Verify response
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert response.json()[0]['city_name'] == 'Paris'
        assert response.json()[0]['country_name'] == 'France'


@pytest.mark.django_db
def test_city_autocomplete_no_query(api_client):
    """Test city autocomplete with missing query parameter"""
    # Call without query parameter
    response = api_client.get('/cities/')
    
    # Verify error response
    assert response.status_code == 400
    assert 'error' in response.json()
    assert response.json()['error'] == 'No query provided'
