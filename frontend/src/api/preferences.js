import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// Get user travel preferences
export const getUserPreferences = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_URL}/travel_preferences/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message || 'Failed to fetch preferences';
  }
};

// Update user travel preferences
export const updateUserPreferences = async (preferences) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.patch(`${API_URL}/travel_preferences/`, preferences, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message || 'Failed to update preferences';
  }
};

// Get country suggestions based on user preferences
export const getCountrySuggestions = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_URL}/country_suggestions/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message || 'Failed to fetch country suggestions';
  }
};
