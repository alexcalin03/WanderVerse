import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000';

export const fetchFlights = async (origin, destination, departureDate, returnDate = null, adults = 1) => {
    try {
        const response = await axios.get(`${API_BASE}/flights/`, {
            params: { origin, destination, departureDate, returnDate, adults }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching flights:', error);
        throw error;
    }
};
