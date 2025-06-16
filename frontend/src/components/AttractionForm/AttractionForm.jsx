import React, { useState, useEffect } from 'react';
import { fetchCities, fetchAttractions } from '../../api/amadeusAPI';
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';
import AttractionCard from '../AttractionCard/AttractionCard';
import Loading from '../Loading/Loading';
import './AttractionForm.css';

const AttractionForm = ({ onSearch, initialState, onStateChange }) => {
    const [cityCode, setCityCode] = useState(initialState?.cityCode || '');
    const [displayValue, setDisplayValue] = useState(initialState?.displayValue || '');
    const [latitude, setLatitude] = useState(initialState?.latitude || null);
    const [longitude, setLongitude] = useState(initialState?.longitude || null);
    const [results, setResults] = useState(initialState?.results || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if ($ && $.fn.autocomplete) {
            $("#city").autocomplete({
                source: async function (request, response) {
                    try {
                        const data = await fetchCities(request.term);
                        response(data.map(city => ({
                            label: `${city.label}`, 
                            value: city.value,
                            lat: city.latitude,
                            lon: city.longitude
                        })));
                    } catch (error) {
                        console.error("Autocomplete API Error:", error);
                        response([]);
                    }
                },
                minLength: 2,
                select: function (event, ui) {
                    setCityCode(ui.item.value);
                    setDisplayValue(ui.item.label);
                    setLatitude(ui.item.lat);
                    setLongitude(ui.item.lon);
                    $("#city").val(ui.item.label);
                    return false;
                }
            });
        } else {
            console.error("jQuery UI Autocomplete is not available");
        }
    }, []);

    useEffect(() => {
        if (onStateChange) {
            const currentState = {
                cityCode,
                displayValue,
                latitude,
                longitude,
                results
            };
            onStateChange(currentState);
        }
    }, [cityCode, displayValue, latitude, longitude, results, onStateChange]);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if(onSearch) onSearch();
        
        setLoading(true);
        setResults([]);
        setError(null); 
        setHasSearched(true); 

        if (!latitude || !longitude) {
            setError("Please select a city from the suggestions.");
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching attractions for:", { latitude, longitude });
            const data = await fetchAttractions(latitude, longitude);
            
            if (data && data.error) {
                setError(data.error);
                setResults([]);
            } else if (Array.isArray(data) && data.length === 0) {
                setError('No attractions found in this area. Please try a different city.');
                setResults([]);
            } else {
                setResults(data);
                
                if (onStateChange) {
                    onStateChange({
                        cityCode,
                        displayValue,
                        latitude,
                        longitude,
                        results: data
                    });
                }
            }
        } catch (error) {
            console.error("Attractions API Error:", error);
            setError('An unexpected error occurred. Please try again later.');
            setResults([]);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="attraction-form-container">
                <form onSubmit={handleSubmit} className="attraction-form">
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={displayValue}
                        onChange={(e) => setDisplayValue(e.target.value)}
                        placeholder="Where would you like to find attractions?"
                        required
                    />
                    <button type="submit">{loading ? "Searching..." : "Search Attractions"}</button>
                </form>
            </div>

            {loading && <Loading />}

            {!loading && error && (
                <div className="error-message">
                    <p>{error}</p>
                    <p>Please try again with different search parameters.</p>
                </div>
            )}
            
            {!loading && !error && results.length > 0 && (
                <div className="attraction-results">
                    {results.map((attraction, index) => (
                        <AttractionCard key={index} attraction={attraction} />
                    ))}
                </div>
            )}
            
            {!loading && !error && hasSearched && results.length === 0 && (
                <div className="no-results-message">
                    <p>No search results found. Please try different search parameters.</p>
                </div>
            )}
        </>
    );
};

export default AttractionForm;

