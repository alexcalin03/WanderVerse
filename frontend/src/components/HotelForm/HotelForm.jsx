import React, { useState, useEffect } from 'react';
import './HotelForm.css';
import { fetchHotels, fetchCities } from '../../api/amadeusAPI';
import HotelCard from '../HotelCard/HotelCard';
import Loading from '../Loading/Loading';
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';


const HotelForm = ({ onSearch, initialState, onStateChange }) => {
    const [cityCode, setCityCode] = useState(initialState?.cityCode || '');
    const [displayValue, setDisplayValue] = useState(initialState?.displayValue || '');
    const [checkInDate, setCheckInDate] = useState(initialState?.checkInDate || '');
    const [checkOutDate, setCheckOutDate] = useState(initialState?.checkOutDate || '');
    const [adults, setAdults] = useState(initialState?.adults || 1);
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
                            value: city.value
                        })));
                    } catch (error) {
                        console.error(" Autocomplete API Error:", error);
                        response([]);
                    }
                },
                minLength: 2,
                select: function (event, ui) {
                    setCityCode(ui.item.value);
                    setDisplayValue(ui.item.label);
                    $("#city").val(ui.item.label);
                    return false;
                },
                open: function (event, ui) {
                    $(".ui-autocomplete").css({
                        top: $("#city").offset().top + $("#city").outerHeight(),
                        left: $("#city").offset().left,
                        width: $("#city").outerWidth()
                    });
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
                checkInDate,
                checkOutDate,
                adults,
                results
            };
            onStateChange(currentState);
        }
    }, [cityCode, displayValue, checkInDate, checkOutDate, adults, results]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cityCode) {
            setError("Please select a city from the suggestions.");
            return;
        }
        
        if(onSearch) onSearch();
        
        setLoading(true);
        setResults([]);
        setError(null); 
        setHasSearched(true); 
        
        try {
            const data = await fetchHotels(cityCode, checkInDate, checkOutDate, adults);
            
            if (data && data.error) {
                setError(data.error);
                setResults([]);
            } else if (Array.isArray(data) && data.length === 0) {
                setError('No hotels found matching your criteria. Please try different search parameters.');
                setResults([]);
            } else {
                setResults(data);
                
                if (onStateChange) {
                    onStateChange({
                        cityCode,
                        displayValue,
                        checkInDate,
                        checkOutDate,
                        adults,
                        results: data
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching hotels:', error);
            setError('An unexpected error occurred. Please try again later.');
            setResults([]);
        }
        setLoading(false);
    };


    return (
        <>
        <div className="hotel-form-container">
            <form onSubmit={handleSubmit} className="hotel-form">
    <div className="input-fields">
        <input
            id="city"
            type="text"
            placeholder="Enter City Name"
            value={displayValue}
            onChange={(e) => setDisplayValue(e.target.value)}
            required
        />
        <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            required
        />
        <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            required
        />
        <input
            type="number"
            min="1"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            required
        />
        <button type="submit" disabled={loading || !cityCode}>
            {loading ? "Searching..." : "Search Hotels"}
        </button>
    </div>
</form>

        </div>
        <div className="hotel-results">
            {loading && <Loading />}
            
            {!loading && error && (
                <div className="error-message">
                    <p>{error}</p>
                    <p>Please try again with different search parameters.</p>
                </div>
            )}
            
            {!loading && !error && results.length > 0 && (
                <>
                    {results.map((hotel, index) => (
                        <HotelCard key={index} hotel={hotel} checkInDate={checkInDate} checkOutDate={checkOutDate} />
                    ))}
                </>
            )}
            
            {!loading && !error && hasSearched && results.length === 0 && (
                <div className="no-results-message">
                    <p>No search results found. Please try different search parameters.</p>
                </div>
            )}
        </div>
        
   </> );
};

export default HotelForm;