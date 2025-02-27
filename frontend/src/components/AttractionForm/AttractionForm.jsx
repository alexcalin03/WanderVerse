import React, { useState, useEffect } from 'react';
import { fetchCities, fetchAttractions } from '../../api/amadeusAPI';
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';
import AttractionCard from '../AttractionCard/AttractionCard';
import Loading from '../Loading/Loading';
import './AttractionForm.css';

const AttractionForm = () => {
    const [cityCode, setCityCode] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [results, setResults] = useState([]);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
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

