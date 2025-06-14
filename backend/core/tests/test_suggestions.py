import pytest
from unittest.mock import patch
from rest_framework import status


@pytest.mark.django_db
class TestSuggestionsIntegration:
    """Integration tests for the travel suggestions feature"""

    def test_suggestions_with_default_preferences(self, authenticated_client, user_travel_preferences, mock_travel_suggestions):
        """Test getting suggestions with default user preferences"""
        with patch('core.views.generate_travel_suggestions') as mock_generate:
            # Use mock suggestions from fixture
            mock_generate.return_value = mock_travel_suggestions
            
            # Get suggestions
            response = authenticated_client.get('/suggestions/')
            
            # Verify response
            assert response.status_code == status.HTTP_200_OK
            assert "suggestions" in response.json()
            assert len(response.json()["suggestions"]) == len(mock_travel_suggestions["suggestions"])
            assert response.json()["suggestions"][0]["country"] == "France"
            
            # Verify the mock was called with the user's preferences
            mock_generate.assert_called_once()
            # The first argument should be the user_travel_preferences object
            preferences_arg = mock_generate.call_args[0][0]
            assert preferences_arg.user.username == 'testuser'
            assert 'FR' in preferences_arg.preferred_countries
            assert 'beach' in preferences_arg.preferred_activities

    def test_update_preferences_then_get_suggestions(self, authenticated_client, test_user, create_travel_preferences):
        """Test updating user preferences and then getting personalized suggestions"""
        # First, update the user's travel preferences
        preference_data = {
            "preferred_countries": ["JP", "TH", "SG"],
            "preferred_activities": ["food", "temples", "shopping"],
            "preferred_climate": "tropical",
            "preferred_budget_range": "luxury"
        }
        
        # Update preferences
        pref_response = authenticated_client.put('/travel_preferences/', preference_data, format='json')
        assert pref_response.status_code == status.HTTP_200_OK
        
        # Mock the suggestions service
        with patch('core.views.generate_travel_suggestions') as mock_generate:
            # Create custom mock suggestions based on the updated preferences
            custom_suggestions = {
                "suggestions": [
                    {
                        "name": "Tokyo Tower",
                        "city": "Tokyo",
                        "country": "Japan",
                        "description": "Iconic tower with amazing city views, perfect for luxury travelers",
                        "image_keyword": "Tokyo Tower Japan"
                    },
                    {
                        "name": "Grand Palace",
                        "city": "Bangkok",
                        "country": "Thailand",
                        "description": "Stunning temple complex in tropical climate",
                        "image_keyword": "Grand Palace Bangkok"
                    }
                ]
            }
            mock_generate.return_value = custom_suggestions
            
            # Get suggestions
            response = authenticated_client.get('/suggestions/')
            
            # Verify response
            assert response.status_code == status.HTTP_200_OK
            assert "suggestions" in response.json()
            assert len(response.json()["suggestions"]) == 2
            
            # Verify the mock was called with updated preferences
            mock_generate.assert_called_once()
            preferences_arg = mock_generate.call_args[0][0]
            assert preferences_arg.user.username == 'testuser'
            assert 'JP' in preferences_arg.preferred_countries
            assert 'TH' in preferences_arg.preferred_countries
            assert 'food' in preferences_arg.preferred_activities
            assert preferences_arg.preferred_climate == 'tropical'
            assert preferences_arg.preferred_budget_range == 'luxury'

    def test_create_preferences_for_new_user(self, authenticated_client, create_travel_preferences):
        """Test creating preferences for a user who doesn't have any yet"""
        # First, make sure user has no preferences (this should be the case for a new user)
        
        # Create new preferences
        preference_data = {
            "preferred_countries": ["CA", "NO", "IS"],
            "preferred_activities": ["hiking", "nature", "northern lights"],
            "preferred_climate": "cold",
            "preferred_budget_range": "mid-range"
        }
        
        # Create preferences
        pref_response = authenticated_client.put('/travel_preferences/', preference_data, format='json')
        assert pref_response.status_code == status.HTTP_200_OK
        
        # Mock the suggestions service
        with patch('core.views.generate_travel_suggestions') as mock_generate:
            # Setup mock response based on the new preferences
            mock_suggestions = {
                "suggestions": [
                    {
                        "name": "Banff National Park",
                        "city": "Banff",
                        "country": "Canada",
                        "description": "Beautiful mountain landscapes for hiking enthusiasts",
                        "image_keyword": "Banff National Park"
                    }
                ]
            }
            mock_generate.return_value = mock_suggestions
            
            # Get suggestions
            response = authenticated_client.get('/suggestions/')
            
            # Verify response
            assert response.status_code == status.HTTP_200_OK
            assert "suggestions" in response.json()
            
            # Verify the mock was called with new preferences
            mock_generate.assert_called_once()
            preferences_arg = mock_generate.call_args[0][0]
            assert preferences_arg.user.username == 'testuser'
            assert 'CA' in preferences_arg.preferred_countries
            assert 'hiking' in preferences_arg.preferred_activities
            assert preferences_arg.preferred_climate == 'cold'

    def test_suggestions_error_handling(self, authenticated_client, test_user, create_travel_preferences):
        # Use the fixture to create preferences
        preferences = create_travel_preferences(
            user=test_user,
            preferred_countries=['DE', 'UK', 'NL'],
            preferred_activities=['museums', 'architecture'],
            preferred_climate='moderate',
            preferred_budget_range='budget'
        )
        """Test error handling in the suggestions endpoint"""
        with patch('core.views.generate_travel_suggestions') as mock_generate:
            # Simulate an error in the suggestions service
            mock_generate.side_effect = Exception("API service unavailable")
            
            # Get suggestions
            response = authenticated_client.get('/suggestions/')
            
            # Verify error response
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert "error" in response.json()
            assert "API service unavailable" in response.json()["error"]

    def test_unauthenticated_access_denied(self, api_client):
        """Test that unauthenticated users cannot access suggestions"""
        response = api_client.get('/suggestions/')
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
