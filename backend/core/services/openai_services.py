from openai import OpenAI
import json
import os
import sys
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')

if not api_key:
    print("WARNING: OPENAI_API_KEY environment variable is not set. Fallback responses will be used.")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

def generate_travel_suggestions(user_preferences):
    """
    Generate travel destination suggestions based on user preferences using OpenAI API.
    Args:
        user_preferences: A UserTravelPreferences object with user's travel preferences
    Returns:
        A list of suggested destinations with details like name, city, country, and image link
    """
    prompt = _build_suggestion_prompt(user_preferences)
    
    functions = [
        {
            "name": "generate_travel_suggestions",
            "description": "Returns personalized travel destination suggestions based on user preferences.",
            "parameters": {
                "type": "object",
                "properties": {
                    "suggestions": {
                        "type": "array",
                        "description": "List of at least 10 destinations recommendations based on user preferences",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "Name of the landmark or attraction"
                                },
                                "city": {
                                    "type": "string",
                                    "description": "City where this attraction is located"
                                },
                                "country": {
                                    "type": "string",
                                    "description": "Country where this attraction is located"
                                },
                                "description": {
                                    "type": "string",
                                    "description": "Brief description of why this matches the user's preferences"
                                },
                                "image_keyword": {
                                    "type": "string",
                                    "description": "A search term for finding an image of this destination (e.g. 'Eiffel Tower Paris')"
                                }
                            },
                            "required": ["name", "city", "country", "description", "image_keyword"]
                        }
                    }
                },
                "required": ["suggestions"]
            }
        }
    ]

    try:
        if not api_key:
            print("No OpenAI API key available, using fallback suggestions")
            return _get_fallback_suggestions(user_preferences)
            
       
        response = client.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": "You are a helpful travel assistant that provides destination recommendations based on user preferences. Return only JSON data via function calls without additional commentary."},
                {"role": "user", "content": prompt}
            ],
            tools=[
                {
                    "type": "function",
                    "function": functions[0]
                }
            ],
            tool_choice={"type": "function", "function": {"name": "generate_travel_suggestions"}}
        )
        
        tool_call = response.choices[0].message.tool_calls[0]
        suggestions_json = json.loads(tool_call.function.arguments)
        
        return suggestions_json
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        fallback = _get_fallback_suggestions(user_preferences)
        if fallback["suggestions"]:
            fallback["suggestions"][0]["description"] += f" (Error: {str(e)})"
        return fallback

def _build_suggestion_prompt(user_preferences):
    """
    Build a detailed prompt for the OpenAI API based on user preferences
    Args:
        user_preferences: A UserTravelPreferences object  
    Returns:
        String prompt describing the user's preferences
    """
    countries = user_preferences.preferred_countries if user_preferences.preferred_countries else []
    activities = user_preferences.preferred_activities if user_preferences.preferred_activities else []
    climate = user_preferences.preferred_climate if user_preferences.preferred_climate else ""
    budget = user_preferences.preferred_budget_range if user_preferences.preferred_budget_range else ""
    travel_style = user_preferences.travel_style if user_preferences.travel_style else {}
    
    prompt = "Suggest 10 travel destinations based on these preferences:\n"
    
    if countries:
        prompt += f"Preferred countries: {', '.join(countries)}\n"
    
    if activities:
        prompt += f"Preferred activities: {', '.join(activities)}\n"
    
    if climate:
        prompt += f"Preferred climate: {climate}\n"
    
    if budget:
        prompt += f"Budget range: {budget}\n"
    
    if travel_style:
        style_items = [f"{k}: {v}" for k, v in travel_style.items()]
        prompt += f"Travel style: {', '.join(style_items)}\n"
    
    prompt += "\nFor each suggestion, provide a specific landmark or attraction name, the city and country where it's located, "
    prompt += "a brief description explaining why it matches the preferences, and a search term for finding an image."
    prompt += "\nIf the preferences are minimal, provide diverse suggestions from different regions of the world."
    
    return prompt

def _get_fallback_suggestions(user_preferences):
    """
    Generate fallback suggestions based on user preferences when OpenAI API is unavailable
    Args:
        user_preferences: A UserTravelPreferences object
    Returns:
        A dictionary with a list of suggested destinations
    """
    default_suggestions = {
        "suggestions": [
            {
                "name": "Eiffel Tower",
                "city": "Paris",
                "country": "France",
                "description": "Iconic landmark with stunning city views",
                "image_keyword": "Eiffel Tower Paris"
            },
            {
                "name": "Colosseum",
                "city": "Rome",
                "country": "Italy",
                "description": "Ancient amphitheater with rich history",
                "image_keyword": "Roman Colosseum"
            },
            {
                "name": "Statue of Liberty",
                "city": "New York",
                "country": "USA",
                "description": "Symbol of freedom and American culture",
                "image_keyword": "Statue of Liberty New York"
            }
        ]
    }
    
    if user_preferences.preferred_countries and len(user_preferences.preferred_countries) > 0:
        countries = ", ".join(user_preferences.preferred_countries)
        default_suggestions["suggestions"][0]["description"] += f" (Note: Based on your interest in {countries})"
    
    default_suggestions["error"] = "Using fallback suggestions. Please check the OpenAI API key configuration."
    
    return default_suggestions