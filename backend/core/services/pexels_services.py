import requests
import os

PEXELS_API_KEY = 'HAJLiOgyelZGWk65Qa5gg5owLYMSpyjj3BvjuBrsceMJmLx7STLyzhLX'

def search_photos(query, per_page=15):
    """
    Search for photos on Pexels API
    
    Args:
        query (str): Search query string
        per_page (int): Number of photos to return
        
    Returns:
        dict: JSON response from Pexels API
    """
    try:
        cache_buster = int(requests.get('https://www.timeapi.io/api/Time/current/zone?timeZone=UTC').json().get('unixTime', 0))
        
        headers = {
            'Authorization': PEXELS_API_KEY
        }
        
        url = f'https://api.pexels.com/v1/search?query={query}&per_page={per_page}&timestamp={cache_buster}'
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()  
        
        return response.json()
    except Exception as e:
        print(f"Pexels API error: {str(e)}")
        return {"error": str(e), "photos": []}
