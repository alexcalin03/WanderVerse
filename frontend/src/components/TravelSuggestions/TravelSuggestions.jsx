import React, { useState, useEffect } from 'react';
import { useSuggestions } from '../../context/SuggestionsContext';
import axios from 'axios';
import './TravelSuggestions.css';

// Using backend proxy for Pexels API instead of direct API key

const SuggestionCard = ({ suggestion, index, onClick }) => {
  // Track both local state and global state
  const [localPhoto, setLocalPhoto] = useState(suggestion.photoUrl || null);
  const [isLoading, setIsLoading] = useState(!suggestion.photoUrl && !localPhoto);
  const { updateSuggestionWithPhoto } = useSuggestions();


  useEffect(() => {
    if (suggestion.photoUrl) {
      setLocalPhoto(suggestion.photoUrl);
      setIsLoading(false);
    }
  }, [suggestion.photoUrl]);

 
  useEffect(() => {
    // If we already have a photo (either local or from context), don't fetch
    if (localPhoto || suggestion.photoUrl) {
      return;
    }

    const fetchPhoto = async () => {
      try {
        setIsLoading(true);
        // Add a cache buster to avoid browser cache issues
        const cacheBuster = new Date().getTime();
        // Get token for authentication with our backend
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Use our backend proxy instead of calling Pexels directly
        const response = await axios.get(
          `http://127.0.0.1:8000/photos/?query=${encodeURIComponent(`${suggestion.name} `)}&per_page=15`,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.photos && response.data.photos.length > 0) {
          // Get a consistent photo based on the suggestion properties
          const photoIndex = Math.abs(suggestion.name.charCodeAt(0) + suggestion.country.charCodeAt(0)) % response.data.photos.length;
          const photoUrl = response.data.photos[photoIndex].src.medium;
          
          // Update both local state and global state
          setLocalPhoto(photoUrl);
          updateSuggestionWithPhoto(suggestion.id, photoUrl);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(`Error fetching photo for ${suggestion.name}:`, error);
        setIsLoading(false);
      }
    };

    // Use a consistent delay based on the index
    const delay = index * 150; 
    const timer = setTimeout(() => fetchPhoto(), delay);
    return () => clearTimeout(timer);
  }, [suggestion.id, suggestion.name, suggestion.country, index, localPhoto]);

  return (
    <div 
      className="suggestion-card"
      onClick={() => onClick(suggestion)}
    >
      <div className="suggestion-image">
        <div 
          className="image-container"
          style={{
            backgroundImage: (localPhoto || suggestion.photoUrl) ? `url(${localPhoto || suggestion.photoUrl})` : 'none',
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
              opacity: (localPhoto || suggestion.photoUrl) && !isLoading ? 0 : 1, 
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

  // Fetch is now managed by SuggestionsContext only, no need for duplicate fetching here

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
            section={section}
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
