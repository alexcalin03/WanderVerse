import React, { useState, useEffect } from 'react';
import './FlightCard.css';
import FlightModal from '../FlightModal/FlightModal';

// Function to format duration (e.g., PT5H45M → 5h 45m)
const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    const hours = hoursMatch ? `${hoursMatch[1]}h` : "";
    const minutes = minutesMatch ? `${minutesMatch[1]}m` : "";

    return `${hours} ${minutes}`.trim(); 
};


const FlightSection = ({ title, flight }) => {
    if (!flight) return null; 

    const hasConnection = flight.segments.length > 1; 

    return (
        <div className="flight-section">
            <h3>{title}</h3>
            <p className="total-duration">{formatDuration(flight.duration)}</p>

            <div className="route">
                <span className="airport">{flight.from}</span>
                <span className="arrow">➝</span>
                <span className="airport">{flight.to}</span>
            </div>

            {hasConnection && <p className="connection-warning">⚠ Connection</p>}
        </div>
    );
};

const FlightCard = ({ flight }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";  
        } else {
            document.body.style.overflow = "auto";  
        }

        return () => {
            document.body.style.overflow = "auto";  
        };
    }, [isModalOpen]);

    return (
        <>
            <div className="flight-card" onClick={() => setIsModalOpen(true)}>
                {/* Left Section - Airline Name */}
                <div className="flight-left">
                    <p className="airline"><strong>{flight.airline}</strong></p>
                </div>

                {/* Right Section - Flight Details & Price */}
                <div className="flight-right">
                    <FlightSection title="Outbound Flight" flight={flight.outbound} />
                    {flight.return && <FlightSection title="Return Flight" flight={flight.return} />}
                    <p className="price">{flight.price} {flight.currency}</p>
                </div>
            </div>

            {isModalOpen && <FlightModal flight={flight} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};


export default FlightCard;
