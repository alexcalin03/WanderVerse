import React from 'react';
import './HotelCard.css';

const HotelCard = ({ hotel }) => {
    return (
        <div className="hotel-card">
            <h3>{hotel.name}</h3>
            <p><strong>Rating:</strong> {hotel.rating || "N/A"}</p>
            <p><strong>Address:</strong> {hotel.address || "Unknown"}</p>
            <p><strong>Price:</strong> {hotel.price} {hotel.currency}</p>
            <p><strong>Room Type:</strong> {hotel.room_type}</p>
            {hotel.website && (
                <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                    <button className="book-button">Book Now</button>
                </a>
            )}
        </div>
    );
};

export default HotelCard;
