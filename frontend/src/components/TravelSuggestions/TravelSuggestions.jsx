import React, { useState, useEffect } from 'react';
import { useSuggestions } from '../../context/SuggestionsContext';
import axios from 'axios';
import './TravelSuggestions.css';

// Pexels API key - in a real app, this should be in an environment variable
const PEXELS_API_KEY = 'HAJLiOgyelZGWk65Qa5gg5owLYMSpyjj3BvjuBrsceMJmLx7STLyzhLX';

// Individual suggestion card component with its own photo state
const SuggestionCard = ({ suggestion, index, onClick }) => {
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch photo for this specific card
  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setIsLoading(true);
        // Create a completely unique query for each suggestion
        // Use both suggestion text and a timestamp to ensure uniqueness
        const timestamp = new Date().getTime();
        const uniqueQuery = `${suggestion.name} ${suggestion.country} ${index} ${timestamp % 1000}`;
        const randomOffset = Math.floor(Math.random() * 10); // Random page offset
        
        // Make the API call with completely unique parameters
        const response = await axios.get(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${suggestion.name} ${suggestion.country}`)}`,
          {
            headers: {
              Authorization: PEXELS_API_KEY
            }
          }
        );
        
        if (response.data.photos && response.data.photos.length > 0) {
          // Pick a random photo from the results to ensure variety
          const randomIndex = Math.floor(Math.random() * response.data.photos.length);
          setPhoto(response.data.photos[randomIndex].src.medium);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(`Error fetching photo for ${suggestion.name}:`, error);
        setIsLoading(false);
      }
    };

    // Add a small random delay before fetching to prevent API rate limiting issues
    const delay = index * 200 + Math.random() * 300;
    const timer = setTimeout(() => fetchPhoto(), delay);
    return () => clearTimeout(timer);
  }, [suggestion.name, suggestion.country, index]);

  return (
    <div 
      className="suggestion-card"
      onClick={() => onClick(suggestion)}
    >
      <div className="suggestion-image">
        <div 
          className="image-container"
          style={{
            backgroundImage: photo ? `url(${photo})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '180px',
            width: '100%',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="image-loading-overlay" 
            style={{ 
              opacity: photo && !isLoading ? 0 : 1, 
              backgroundColor: 'rgba(4, 173, 138, 0.7)' 
            }}
          >
            {suggestion.name[0]}
          </div>
        </div>
      </div>
      <div className="suggestion-details">
        <h3>{suggestion.name}</h3>
        <p className="suggestion-location">{suggestion.city || ''}, {suggestion.country}</p>
        <p className="suggestion-description">{suggestion.description}</p>
      </div>
    </div>
  );
};

const TravelSuggestions = ({ onSearch, section }) => {
  const { suggestions, loading, error, fetchSuggestions } = useSuggestions();

  useEffect(() => {
    // Fetch suggestions if they haven't been fetched yet
    if (!suggestions.length && !loading && !error) {
      fetchSuggestions();
    }
  }, [suggestions, loading, error, fetchSuggestions]);

  if (loading) {
    return <div className="suggestions-loading">Loading personalized travel suggestions...</div>;
  }

  if (error) {
    return <div className="suggestions-error">{error}</div>;
  }

  if (!suggestions.length) {
    return <div className="suggestions-empty">No travel suggestions available</div>;
  }

  const handleCardClick = (suggestion) => {
    // ONLY open Google search in a new tab
    const searchQuery = `${suggestion.name}, ${suggestion.country}`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleSearchUrl, '_blank');
  };

  return (
    <div className="travel-suggestions-container">
      <h2>Places to visit</h2>
      <p className="suggestions-intro">Based on your travel preferences</p>
      
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            suggestion={suggestion}
            index={index}
            onClick={handleCardClick}
          />
        ))}
      </div>
      
      <button 
        className="refresh-suggestions-btn"
        onClick={() => fetchSuggestions(true)}
      >
        Refresh Suggestions
      </button>
    </div>
  );
};

export default TravelSuggestions;
