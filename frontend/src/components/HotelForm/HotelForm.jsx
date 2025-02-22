import React, { useState, useEffect } from 'react';
import './HotelForm.css';
import { fetchHotels, fetchCities } from '../../api/amadeusAPI';
import HotelCard from '../HotelCard/HotelCard';
import Loading from '../Loading/Loading'; // Import reusable loading component
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';


const HotelForm = () => {
    const [cityCode, setCityCode] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [adults, setAdults] = useState(1);
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
    
    
    



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults([]);  
        
        try {
            const data = await fetchHotels(cityCode, checkInDate, checkOutDate, adults);
            setResults(data);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        }
        setLoading(false);
    };

    return (
        <div className="hotel-form-container">
            <form onSubmit={handleSubmit} className="hotel-form">
    <div className="input-fields">
        <input
            id="city"
            type="text"
            placeholder="Enter City Code (e.g., LON)"
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
        <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search Hotels"}
        </button>
    </div>
</form>

            {loading && <Loading />}

            {!loading && results.length > 0 && (
                <div className="hotel-results">
                    {results.map((hotel, index) => (
                        <HotelCard key={index} hotel={hotel} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HotelForm;