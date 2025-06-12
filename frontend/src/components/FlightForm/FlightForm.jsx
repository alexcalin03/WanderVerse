import React, { useState, useEffect } from 'react';
import './FlightForm.css';
import { fetchFlights, fetchAirports } from '../../api/amadeusAPI';
import FlightCard from '../FlightCard/FlightCard';
import Loading from '../Loading/Loading'; // Import reusable loading component
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';


const FlightForm = ({ onSearch, initialState, onStateChange }) => {
    // Initialize state from initialState if provided, otherwise use defaults
    const [tripType, setTripType] = useState(initialState?.tripType || 'one-way');
    const [origin, setOrigin] = useState(initialState?.origin || '');
    const [destination, setDestination] = useState(initialState?.destination || '');
    const [departureDate, setDepartureDate] = useState(initialState?.departureDate || '');
    const [returnDate, setReturnDate] = useState(initialState?.returnDate || '');
    const [adults, setAdults] = useState(initialState?.adults || 1);
    const [results, setResults] = useState(initialState?.results || []);
    const [loading, setLoading] = useState(false);

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

    // Save current form state whenever any input changes
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
        
        // Call onSearch immediately when form is submitted
        if(onSearch) onSearch();
        
        setLoading(true);
        try {
            const data = await fetchFlights(origin, destination, departureDate, tripType === 'round-trip' ? returnDate : null, adults);
            setResults(data);
            
            // Save the final state with results
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
        } catch (error) {
            console.error('Error fetching flights:', error);
        }
        setLoading(false);
    };

    return (
        <>
            {/* Always show the form under the navbar */}
            <div className="flight-form-container">
                <form onSubmit={handleSubmit} className="flight-form">
                    
                    {/*  One-Way / Round-Trip Selector at the Top */}
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
    
                    {/*  Input Fields for Origin, Destination, Dates, and Adults */}
                    <div className="input-fields">
                        <input id='origin' type="text" placeholder="Origin (e.g., MAD)" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                        <input id='destination' type="text" placeholder="Destination (e.g., ATH)" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                        <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
                        
                        {/* Show Return Date Only If Round-Trip is Selected */}
                        {tripType === 'round-trip' && (
                            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
                        )}
    
                        <input type="number" min="1" value={adults} onChange={(e) => setAdults(e.target.value)} />
                        <button type="submit">{loading ? "Searching..." : "Search Flights"}</button>
                    </div>
                </form>
            </div>
    
            {/* Show loading indicator while fetching flights */}
            {loading && <Loading />}
    
            {/* Display search results */}
            {!loading && results.length > 0 && (
                <div className="flight-results">
                    {results.map((flight, index) => (
                        <FlightCard key={index} flight={flight} />
                    ))}
                </div>
            )}
        </>
    );
    
    
    
}  

export default FlightForm;
