import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000';

export const fetchFlights = async (origin, destination, departureDate, returnDate = null, adults = 1) => {
    const cacheKey = `${origin}-${destination}-${departureDate}-${returnDate}-${adults}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
        console.log('Using cached data');
        return JSON.parse(cachedData);
    }
    try {
        const response = await axios.get(`${API_BASE}/flights/`, {
            params: { origin, destination, departureDate, returnDate, adults }
        });
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('Error fetching flights:', error);
        throw error;
    }
};

export const fetchHotels = async (cityCode, checkInDate, checkOutDate, adults = 1) => {
    const cacheKey = `${cityCode}-${checkInDate}-${checkOutDate}-${adults}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
        console.log('Using cached data');
        return JSON.parse(cachedData);
    }
    try {
        const response = await axios.get(`${API_BASE}/hotels/`, {
            params: { cityCode, checkInDate, checkOutDate, adults }
        });
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('Error fetching hotels:', error);
        throw error;
    }
}

export const fetchCities = async (query) => {
    try {
        const response = await axios.get(`${API_BASE}/cities/`, {
            params: { query }
        });
        return response.data.map(item => ({
            label: `${item.city_name}, ${item.country_name}`,
            value: item.iata_code
        }));
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
} 


export const fetchAirports = async (query) => {
    try {
        const response = await axios.get(`${API_BASE}/airports/`, {
            params: { query }
        });

        return response.data.map(item => ({
            label: `${item.airport_name} (${item.iata_code}), ${item.city_name}`,
            value: item.iata_code
        }));
    } catch (error) {
        console.error('Error fetching airports:', error);
        return [];
    }
};
