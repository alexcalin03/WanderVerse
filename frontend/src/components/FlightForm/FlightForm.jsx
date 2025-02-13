import React, { useState, useEffect } from 'react';
import './FlightForm.css';
import { fetchFlights } from '../../api/amadeusAPI';
import FlightCard from '../FlightCard/FlightCard';
import Loading from '../Loading/Loading'; // Import reusable loading component
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';

const API_BASE = 'http://127.0.0.1:8000';

const FlightForm = () => {
    const [tripType, setTripType] = useState('one-way');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && $ && $.fn.autocomplete) {
            console.log("✅ jQuery and jQuery UI Loaded");

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
                    
                    {/* ✅ One-Way / Round-Trip Selector at the Top */}
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
    
                    {/* ✅ Wrap input fields in a flex row */}
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
