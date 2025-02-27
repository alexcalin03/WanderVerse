import React from 'react';
import './AttractionCard.css';

const AttractionCard = ({ attraction }) => {
    return (
        <div className="attraction-card">
            {/* Left Section - Attraction Image */}
            <div className="attraction-image">
                <img 
                    src={attraction.image || "/resources/placeholder-attraction.png"} 
                    alt={attraction.name} 
                />
            </div>

            {/*  Right Section - Attraction Details */}
            <div className="attraction-info">
                <h3 className="attraction-name">{attraction.name}</h3>

                {/*  Show rating only if it exists */}
                {attraction.rating && (
                    <p className="attraction-rating">⭐ {attraction.rating}</p>
                )}

                <p className="attraction-price">
                    {attraction.price ? `${attraction.price} ${attraction.currency}` : "Price not available"}
                </p>

                {/* See Details Button */}
                <a 
                    href={attraction.bookingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="see-details-btn"
                >
                    See Details
                </a>
            </div>
        </div>
    );
};

export default AttractionCard;
