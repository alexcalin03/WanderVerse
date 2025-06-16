import React, { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../../api/preferences';
import './UserPreferencesModal.css';
import countriesData from './countries.js';

const UserPreferencesModal = ({ show, onClose }) => {
  const [preferences, setPreferences] = useState({
    preferred_countries: [],
    preferred_activities: [],
    preferred_climate: '',
    preferred_budget_range: '',
    travel_style: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activities = ['Beach', 'Mountains', 'City', 'Cultural', 'Food', 'Adventure', 'Relaxation', 'Sightseeing', 'Hiking', 'Shopping'];
  const climates = ['Warm', 'Cold', 'Tropical', 'Moderate', 'Desert', 'Mediterranean', 'Arctic'];
  const budgetRanges = ['Budget', 'Mid-Range', 'Luxury', 'Ultra-Luxury'];

  useEffect(() => {
    if (show) {
      fetchPreferences();
    }
  }, [show]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await getUserPreferences();
      setPreferences(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load preferences. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await updateUserPreferences(preferences);
      onClose();
      alert('Travel preferences updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
    }
  };

  const handleCountrySelect = (countryCode) => {
    if (!preferences.preferred_countries.includes(countryCode)) {
      setPreferences({
        ...preferences,
        preferred_countries: [...preferences.preferred_countries, countryCode]
      });
    }
    setSearchTerm('');
  };

  const handleRemoveCountry = (countryCode) => {
    setPreferences({
      ...preferences,
      preferred_countries: preferences.preferred_countries.filter(code => code !== countryCode)
    });
  };

  const handleActivityToggle = (activity) => {
    const currentActivities = preferences.preferred_activities || [];
    if (currentActivities.includes(activity)) {
      setPreferences({
        ...preferences,
        preferred_activities: currentActivities.filter(a => a !== activity)
      });
    } else {
      setPreferences({
        ...preferences,
        preferred_activities: [...currentActivities, activity]
      });
    }
  };

  const filteredCountries = searchTerm 
    ? Object.entries(countriesData)
        .filter(([code, name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 10) 
    : [];

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal preferences-modal">
        <h2>Travel Preferences</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading preferences...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Preferred Countries</h3>
              <div className="country-search">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="country-dropdown">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(([code, name]) => (
                        <div 
                          key={code} 
                          className="country-option"
                          onClick={() => handleCountrySelect(code)}
                        >
                          {name}
                        </div>
                      ))
                    ) : (
                      <div className="no-results">No countries found</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="selected-countries">
                {preferences.preferred_countries?.map(code => (
                  <div key={code} className="country-tag">
                    {countriesData[code] || code}
                    <button 
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveCountry(code)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {preferences.preferred_countries?.length === 0 && (
                  <div className="empty-message">No countries selected</div>
                )}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Preferred Activities</h3>
              <div className="activities-grid">
                {activities.map(activity => (
                  <div 
                    key={activity} 
                    className={`activity-chip ${preferences.preferred_activities?.includes(activity) ? 'selected' : ''}`}
                    onClick={() => handleActivityToggle(activity)}
                  >
                    {activity}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Preferred Climate</h3>
              <select
                value={preferences.preferred_climate || ''}
                onChange={(e) => setPreferences({...preferences, preferred_climate: e.target.value})}
              >
                <option value="">Select climate preference</option>
                {climates.map(climate => (
                  <option key={climate} value={climate.toLowerCase()}>
                    {climate}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-section">
              <h3>Budget Range</h3>
              <select
                value={preferences.preferred_budget_range || ''}
                onChange={(e) => setPreferences({...preferences, preferred_budget_range: e.target.value})}
              >
                <option value="">Select budget range</option>
                {budgetRanges.map(range => (
                  <option key={range} value={range.toLowerCase()}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="submit" className="modal-button save">Save Preferences</button>
              <button 
                type="button" 
                className="modal-button cancel"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserPreferencesModal;
