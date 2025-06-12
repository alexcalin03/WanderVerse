import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SuggestionsContext = createContext(null);

export const SuggestionsProvider = ({ children }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

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

      const response = await axios.get('http://127.0.0.1:8000/suggestions/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuggestions(response.data.suggestions || []);
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

  return (
    <SuggestionsContext.Provider 
      value={{
        suggestions,
        loading,
        error,
        fetchSuggestions,
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
