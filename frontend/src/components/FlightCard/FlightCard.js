import React from 'react';
import './FlightCard.css';

// Function to format duration (e.g., PT5H45M → 5h 45m)
const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    const hours = hoursMatch ? `${hoursMatch[1]}h` : "";
    const minutes = minutesMatch ? `${minutesMatch[1]}m` : "";

    return `${hours} ${minutes}`.trim(); // Ensure clean formatting
};

// Flight section component (for both outbound & return flights)
const FlightSection = ({ title, flight }) => {
    if (!flight) return null; // If return flight doesn't exist, hide the section

    const hasConnection = flight.segments.length > 1; // Check if there's a connection

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
    return (
        <div className="flight-card">
            <p className="airline"><strong>{flight.airline}</strong></p>
            <p className="price">{flight.price} {flight.currency}</p>

            {/* Outbound Flight Section */}
            <FlightSection title="Outbound Flight" flight={flight.outbound} />

            {/* Return Flight Section (Only if round-trip) */}
            {flight.return && <FlightSection title="Return Flight" flight={flight.return} />}
        </div>
    );
};

export default FlightCard;
