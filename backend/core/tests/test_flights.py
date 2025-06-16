import pytest
from unittest.mock import patch
from rest_framework import status


@pytest.mark.django_db
def test_flights_default_parameters(api_client):
    with patch('core.views.search_flights') as mock_search:
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
        
        response = api_client.get('/flights/')
        
        assert response.status_code == 200
        assert 'data' in response.json()
        
        mock_search.assert_called_once_with('MAD', 'ATH', '2025-03-03', None, 1)
        mock_search.assert_called_once_with('MAD', 'ATH', '2025-03-03', None, 1)


@pytest.mark.django_db
def test_flights_custom_parameters(api_client):
    with patch('core.views.search_flights') as mock_search:
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
        
        assert response.status_code == 200
        assert 'data' in response.json()
        
        mock_search.assert_called_once_with('JFK', 'LAX', '2025-06-15', '2025-06-22', '2')


@pytest.mark.django_db
def test_flights_error_response(api_client):
    with patch('core.views.search_flights') as mock_search:
        error_response = {'error': 'No flights found for the specified route'}
        mock_search.return_value = error_response
        
        response = api_client.get('/flights/', {'origin': 'AAA', 'destination': 'ZZZ'})
        
        assert response.status_code == 400
        assert 'error' in response.json()
        assert 'Invalid travel data' in response.json()['error']
        assert response.json()['details'] == 'No flights found for the specified route'


@pytest.mark.django_db
def test_flights_empty_results(api_client):
    with patch('core.views.search_flights') as mock_search:
        mock_data = {'data': []}
        mock_search.return_value = mock_data
        
        response = api_client.get('/flights/')
        
        assert response.status_code == 200
        assert 'data' in response.json()
        assert response.json()['data'] == []


@pytest.mark.django_db
def test_flights_with_authenticated_user(authenticated_client):
    with patch('core.views.search_flights') as mock_search:
        mock_data = {'data': [{'id': 'FL1234', 'price': {'total': '250.00'}}]}
        mock_search.return_value = mock_data
        
        response = authenticated_client.get('/flights/')
        
        assert response.status_code == 200
        assert 'data' in response.json()


@pytest.mark.django_db
def test_airport_autocomplete_success(api_client):
    with patch('core.views.search_airports') as mock_search:
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
        
        response = api_client.get('/airports/', {'query': 'Madrid'})
        
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert response.json()[0]['iata_code'] == 'MAD'


@pytest.mark.django_db
def test_airport_autocomplete_no_query(api_client):
    response = api_client.get('/airports/')
    
    assert response.status_code == 400
    assert 'error' in response.json()
    assert response.json()['error'] == 'No query provided'


@pytest.mark.django_db
def test_city_autocomplete_success(api_client):
    with patch('core.views.search_cities') as mock_search:
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
        
        response = api_client.get('/cities/', {'query': 'Paris'})
        
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert response.json()[0]['city_name'] == 'Paris'
        assert response.json()[0]['country_name'] == 'France'


@pytest.mark.django_db
def test_city_autocomplete_no_query(api_client):
    response = api_client.get('/cities/')
    
    assert response.status_code == 400
    assert 'error' in response.json()
    assert response.json()['error'] == 'No query provided'
