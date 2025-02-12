import React, { useState, useEffect } from 'react';
import './FlightForm.css';
import { fetchFlights } from '../../api/amadeusAPI'; // Import the fetchFlights function
import FlightCard from '../FlightCard/FlightCard'; // Import the FlightCard component
import $ from 'jquery'; // Import jQuery
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';

const API_BASE = 'http://127.0.0.1:8000';

const FlightForm = () => {
    const [tripType, setTripType] = useState('one-way'); // One-Way or Round-Trip
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [results, setResults] = useState([]);
    const [isSearched, setIsSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && $ && $.fn.autocomplete) {
            console.log("✅ jQuery and jQuery UI Loaded");
    
            // Origin Airport Autocomplete
            $("#origin").autocomplete({
                source: function (request, response) {
                    
                    fetch(`${API_BASE}/airports/?query=${request.term}`)
                        .then(res => res.json())
                        .then(data => {
                            
                            response(data.map(item => ({
                                label: `${item.airport_name} (${item.iata_code}), ${item.city_name}`,
                                value: item.iata_code
                            })));
                        })
                        .catch(error => {
                            console.error("Autocomplete error:", error);
                            response([]);
                        });
                },
                minLength: 2,
                select: function (event, ui) {
                    setOrigin(ui.item.value);
                }
            });
    
            // Destination Airport Autocomplete
            $("#destination").autocomplete({
                source: function (request, response) {
                    
                    fetch(`${API_BASE}/airports/?query=${request.term}`)
                        .then(res => res.json())
                        .then(data => {
                            
                            response(data.map(item => ({
                                label: `${item.airport_name} (${item.iata_code}), ${item.city_name}`,
                                value: item.iata_code
                            })));
                        })
                        .catch(error => {
                            console.error("Autocomplete error:", error);
                            response([]);
                        });
                },
                minLength: 2,
                select: function (event, ui) {
                    setDestination(ui.item.value);
                }
            });
        } else {
            console.error("❌ jQuery UI Autocomplete is not available");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await fetchFlights(origin, destination, departureDate, tripType === 'round-trip' ? returnDate : null, adults);
            setResults(data);
            setIsSearched(true);
        } catch (error) {
            console.error('Error fetching flights:', error);
        }
        setLoading(false);
    };

    return (
        <div className={`flight-form-container ${isSearched ? 'horizontal' : ''}`}>
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

                <input id='origin' type="text" placeholder="Origin (e.g., MAD)" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                <input id='destination' type="text" placeholder="Destination (e.g., ATH)" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />

                {tripType === 'round-trip' && (
                    <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
                )}

                <input type="number" min="1" value={adults} onChange={(e) => setAdults(e.target.value)} />
                <button type="submit" disabled={loading}>{loading ? "Searching..." : "Search Flights"}</button>
            </form>

            {loading && <div className="loading">Fetching flights...</div>}

            {results.length > 0 && (
                <div className="flight-results">
                    {results.map((flight, index) => (
                        <FlightCard key={index} flight={flight} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlightForm;