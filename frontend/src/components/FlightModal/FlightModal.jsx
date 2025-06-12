import React from "react";
import "./FlightModal.css";

const FlightModal = ({ flight, onClose }) => {
  // Function to generate a flight booking URL based on flight details
  const generateBookingUrl = (flight) => {
    // Extract flight information
    const outboundSegment = flight.outbound.segments[0];
    const departureDate = new Date(outboundSegment.departureTime).toISOString().split('T')[0];
    const originCode = flight.outbound.from;
    const destinationCode = flight.outbound.to;
    
    // Check if it's a round trip
    const isRoundTrip = !!flight.return;
    
    // Get return date if it's a round trip
    const returnDate = isRoundTrip 
      ? new Date(flight.return.segments[0].departureTime).toISOString().split('T')[0]
      : '';
    
    // Get number of adults (default to 1 if not specified)
    const adults = flight.adults || 1;
    
    // Check if it's a known airline and generate a direct airline URL if possible
    const airline = outboundSegment.airline?.toLowerCase() || '';
    
    // Handle specific airlines (add more as needed)
    if (airline.includes('delta')) {
      let url = `https://www.delta.com/flight-search/book-a-flight?cacheKeySuffix=bookAFlight&departure=${originCode}&destination=${destinationCode}&departureDate=${departureDate}&numAdult=${adults}`;
      if (isRoundTrip) {
        url += `&returnDate=${returnDate}`;
      }
      return url;
    }
    if (airline.includes('united')) {
      let url = `https://www.united.com/en/us/flight-search?f=${originCode}&t=${destinationCode}&d=${departureDate}&ad=${adults}`;
      if (isRoundTrip) {
        url += `&r=${returnDate}`;
      }
      return url;
    }
    if (airline.includes('american')) {
      let url = `https://www.aa.com/booking/find-flights?originAirport=${originCode}&destinationAirport=${destinationCode}&departureDate=${departureDate}&adultPassengerCount=${adults}`;
      if (isRoundTrip) {
        url += `&returnDate=${returnDate}`;
      }
      return url;
    }
    if (airline.includes('lufthansa')) {
      let url = `https://www.lufthansa.com/us/en/flight-search?departureCity=${originCode}&arrivalCity=${destinationCode}&departureDate=${departureDate}&adults=${adults}`;
      if (isRoundTrip) {
        url += `&returnDate=${returnDate}&tripType=R`;
      }
      return url;
    }
    if (airline.includes('jetblue')) {
      let url = `https://www.jetblue.com/booking/flights?from=${originCode}&to=${destinationCode}&depart=${departureDate}&isMultiCity=false&noOfRoute=1&adults=${adults}&children=0&infants=0&sharedMarket=false&usePoints=false`;
      if (isRoundTrip) {
        url += `&return=${returnDate}&roundTripFaresFlag=true`;
      } else {
        url += `&roundTripFaresFlag=false`;
      }
      return url;
    }
    
    // Default to Google Flights as a fallback
    let googleUrl = `https://www.google.com/travel/flights?q=Flights%20from%20${originCode}%20to%20${destinationCode}%20on%20${departureDate}`;
    
    if (isRoundTrip) {
      googleUrl = `https://www.google.com/travel/flights?q=Flights%20from%20${originCode}%20to%20${destinationCode}%20on%20${departureDate}%20return%20${returnDate}`;
    }
    
    // Add adults if more than 1
    if (adults > 1) {
      googleUrl += `%20${adults}%20adults`;
    }
    
    return googleUrl;
  };
  
  const handleBookFlight = () => {
    const bookingUrl = generateBookingUrl(flight);
    console.log('Opening booking URL:', bookingUrl);
    window.open(bookingUrl, '_blank');
  };
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
        <button 
          className="book-btn"
          onClick={handleBookFlight}
        >
          Book Flight
        </button>
      </div>
    </div>
  );
};

export default FlightModal;
