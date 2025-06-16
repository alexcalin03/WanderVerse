import React, { useState, useEffect } from 'react';
import './FlightForm.css';
import { fetchFlights, fetchAirports } from '../../api/amadeusAPI';
import FlightCard from '../FlightCard/FlightCard';
import Loading from '../Loading/Loading';
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';


const FlightForm = ({ onSearch, initialState, onStateChange }) => {
    const [tripType, setTripType] = useState(initialState?.tripType || 'one-way');
    const [origin, setOrigin] = useState(initialState?.origin || '');
    const [destination, setDestination] = useState(initialState?.destination || '');
    const [departureDate, setDepartureDate] = useState(initialState?.departureDate || '');
    const [returnDate, setReturnDate] = useState(initialState?.returnDate || '');
    const [adults, setAdults] = useState(initialState?.adults || 1);
    const [results, setResults] = useState(initialState?.results || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && $ && $.fn.autocomplete) {
    
            $("#origin").autocomplete({
                source: async function (request, response) {
                    const data = await fetchAirports(request.term);
                    response(data);
                },
                minLength: 2,
                select: function (event, ui) {
                    setOrigin(ui.item.value);
                }
            });
    
            $("#destination").autocomplete({
                source: async function (request, response) {
                    const data = await fetchAirports(request.term);
                    response(data);
                },
                minLength: 2,
                select: function (event, ui) {
                    setDestination(ui.item.value);
                }
            });
        } else {
        }
    }, []);

    useEffect(() => {
        if (onStateChange) {
            const currentState = {
                tripType,
                origin,
                destination,
                departureDate,
                returnDate,
                adults,
                results
            };
            onStateChange(currentState);
        }
    }, [tripType, origin, destination, departureDate, returnDate, adults, results, onStateChange]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setHasSearched(true);
        onSearch();

        try {
            let data;
            if (tripType === 'round-trip' && returnDate) {
                data = await fetchFlights(origin, destination, departureDate, returnDate, adults);
            } else {
                data = await fetchFlights(origin, destination, departureDate, null, adults);
            }
            
            if (data && data.error) {
                setError(data.error);
                setResults([]);
            } else if (Array.isArray(data) && data.length === 0) {
                setError('No flights found matching your criteria. Please try different search parameters.');
                setResults([]);
            } else {
                setResults(data);
                
                if (onStateChange) {
                    onStateChange({
                        tripType,
                        origin,
                        destination,
                        departureDate,
                        returnDate,
                        adults,
                        results: data
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching flights:', error);
            setError('An unexpected error occurred.');
            setResults([]);
        }
        setLoading(false);
    }

    return (
        <>
            <div className="flight-form-container">
                <form onSubmit={handleSubmit} className="flight-form">
                    
                    <div className="trip-type">
                        <label>
                            <input
                                type="radio"
                                value="one-way"
                                checked={tripType === 'one-way'}
                                onChange={() => setTripType('one-way')}
                            />
                            One-Way
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="round-trip"
                                checked={tripType === 'round-trip'}
                                onChange={() => setTripType('round-trip')}
                            />
                            Round-Trip
                        </label>
                    </div>
    
                    <div className="input-fields">
                        <input id='origin' type="text" placeholder="Origin (e.g., MAD)" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                        <input id='destination' type="text" placeholder="Destination (e.g., ATH)" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                        <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
                        
                        
                        {tripType === 'round-trip' && (
                            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
                        )}
    
                        <input type="number" min="1" value={adults} onChange={(e) => setAdults(e.target.value)} />
                        <button type="submit">{loading ? "Searching..." : "Search Flights"}</button>
                    </div>
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
                <div className="flight-results">
                    {results.map((flight, index) => (
                        <FlightCard key={index} flight={flight} />
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
    
    
    
}  

export default FlightForm;
