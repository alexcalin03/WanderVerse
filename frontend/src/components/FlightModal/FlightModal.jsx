import React from "react";
import "./FlightModal.css";

const FlightModal = ({ flight, onClose }) => {
  if (!flight) return null; // Don't render if no flight is selected

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Flight Details</h2>

        {/* Outbound Flight Details */}
        <div className="flight-section">
          <h3>Outbound Flight</h3>
          <p><strong>{flight.outbound.from} → {flight.outbound.to}</strong></p>
          <p>Departure: {new Date(flight.outbound.segments[0].departureTime).toLocaleTimeString()}</p>
          <p>Arrival: {new Date(flight.outbound.segments[flight.outbound.segments.length - 1].arrivalTime).toLocaleTimeString()}</p>

          {/* Show connection warning if applicable */}
          {flight.outbound.segments.length > 1 && <p className="warning">🚨 Connection Alert</p>}

          {/* Display all segments if connected flights exist */}
          {flight.outbound.segments.map((segment, index) => (
            <div key={index} className="segment">
              <p>{segment.departure} → {segment.arrival}</p>
              <p>Departure: {new Date(segment.departureTime).toLocaleTimeString()}</p>
              <p>Arrival: {new Date(segment.arrivalTime).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>

        {/* Return Flight Details (if available) */}
        {flight.return && (
          <div className="flight-section">
            <h3>Return Flight</h3>
            <p><strong>{flight.return.from} → {flight.return.to}</strong></p>
            <p>Departure: {new Date(flight.return.segments[0].departureTime).toLocaleTimeString()}</p>
            <p>Arrival: {new Date(flight.return.segments[flight.return.segments.length - 1].arrivalTime).toLocaleTimeString()}</p>

            {flight.return.segments.length > 1 && <p className="warning">🚨 Connection Alert</p>}

            {flight.return.segments.map((segment, index) => (
              <div key={index} className="segment">
                <p>{segment.departure} → {segment.arrival}</p>
                <p>Departure: {new Date(segment.departureTime).toLocaleTimeString()}</p>
                <p>Arrival: {new Date(segment.arrivalTime).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Book Button */}
        <button className="book-btn">Book Flight</button>
      </div>
    </div>
  );
};

export default FlightModal;
