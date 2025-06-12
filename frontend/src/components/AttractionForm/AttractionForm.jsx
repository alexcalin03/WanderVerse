import React, { useState, useEffect } from 'react';
import { fetchCities, fetchAttractions } from '../../api/amadeusAPI';
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';
import AttractionCard from '../AttractionCard/AttractionCard';
import Loading from '../Loading/Loading';
import './AttractionForm.css';

const AttractionForm = ({ onSearch, initialState, onStateChange }) => {
    // Initialize state from initialState if provided, otherwise use defaults
    const [cityCode, setCityCode] = useState(initialState?.cityCode || '');
    const [displayValue, setDisplayValue] = useState(initialState?.displayValue || '');
    const [latitude, setLatitude] = useState(initialState?.latitude || null);
    const [longitude, setLongitude] = useState(initialState?.longitude || null);
    const [results, setResults] = useState(initialState?.results || []);
    const [loading, setLoading] = useState(false);

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

    // Save current form state whenever any input changes
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
        
        // Call onSearch immediately when form is submitted
        if(onSearch) onSearch();
        
        setLoading(true);
        setResults([]);

        if (!latitude || !longitude) {
            console.error("Latitude and Longitude are required");
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching attractions for:", { latitude, longitude });
            const data = await fetchAttractions(latitude, longitude);
            setResults(data);
            
            // Save the final state with results
            if (onStateChange) {
                onStateChange({
                    cityCode,
                    displayValue,
                    latitude,
                    longitude,
                    results: data
                });
            }
        } catch (error) {
            console.error("Attractions API Error:", error);
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

            
            {!loading && results.length > 0 && (
                <div className="attraction-results">
                    {results.map((attraction, index) => (
                        <AttractionCard key={index} attraction={attraction} />
                    ))}
                </div>
            )}
        </>
    );
};

export default AttractionForm;

