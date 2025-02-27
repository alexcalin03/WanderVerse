import React from "react";
import "./HotelCard.css";

const HotelCard = ({ hotel, checkInDate, checkOutDate }) => {
    // Calculate the number of nights
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24), 1); // Ensure at least 1 night

    return (
        <div className="hotel-card">
            {/* Left side - Hotel Image */}
            <div className="hotel-image">
                <img src={hotel.image || "/default-hotel.jpg"} alt={hotel.name} />
            </div>

            {/* Right side - Hotel Info */}
            <div className="hotel-info">
                <h2 className="hotel-title">{hotel.name}</h2>
                <p className="hotel-nights">{nights} {nights === 1 ? "night" : "nights"}</p>
                <p className="hotel-price">
                    <strong>{hotel.price} {hotel.currency}</strong>
                </p>
                <p className="hotel-room">Bed Type: {hotel.bed_type || "Not specified"}</p>
            </div>
        </div>
    );
};

export default HotelCard;
