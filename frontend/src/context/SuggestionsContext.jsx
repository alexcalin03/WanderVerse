import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const SuggestionsContext = createContext(null);

export const SuggestionsProvider = ({ children }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [photosToLoad, setPhotosToLoad] = useState(0);
  const [photosLoaded, setPhotosLoaded] = useState(0);

  const fetchSuggestions = async (forceRefresh = false) => {
    if (suggestions.length > 0 && !forceRefresh && lastFetched) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (new Date(lastFetched) > thirtyMinutesAgo) {
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE}/suggestions/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Add unique IDs to each suggestion if they don't already have them
      const suggestionsWithIds = (response.data.suggestions || []).map((suggestion, index) => ({
        ...suggestion,
        // Use existing id or create a unique one based on name, country and index
        id: suggestion.id || `${suggestion.name}-${suggestion.country}-${index}`
      }));
      
      setSuggestions(suggestionsWithIds);
      setLastFetched(new Date());
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching travel suggestions:', err);
      setError('Failed to load travel suggestions');
      setLoading(false);
    }
  };

  // Load suggestions when the component mounts
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Function to update a suggestion with its photo
  const updateSuggestionWithPhoto = (suggestionId, photoUrl) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, photoUrl } 
          : suggestion
      )
    );
    
    // Track photo loading progress
    setPhotosLoaded(prevCount => {
      const newCount = prevCount + 1;
      if (newCount >= photosToLoad && photosToLoad > 0) {
        setPhotosLoading(false);
      }
      return newCount;
    });
  };

  // Reset photo loading tracking when starting new photo fetch
  const resetPhotoLoading = (count) => {
    setPhotosToLoad(count);
    setPhotosLoaded(0);
    setPhotosLoading(true);
  };
  


  return (
    <SuggestionsContext.Provider 
      value={{
        suggestions,
        loading,
        error,
        fetchSuggestions,
        updateSuggestionWithPhoto,
        photosLoading,
        resetPhotoLoading,
        photosToLoad,
        photosLoaded
      }}
    >
      {children}
    </SuggestionsContext.Provider>
  );
};

export const useSuggestions = () => {
  const context = useContext(SuggestionsContext);
  if (context === null) {
    throw new Error('useSuggestions must be used within a SuggestionsProvider');
  }
  return context;
};
