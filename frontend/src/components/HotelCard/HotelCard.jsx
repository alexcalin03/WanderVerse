import React from "react";
import "./HotelCard.css";

const HotelCard = ({ hotel, checkInDate, checkOutDate }) => {
    // Function to generate hotel booking URLs based on hotel details
    const generateBookingUrl = () => {
        // Format dates for URLs (YYYY-MM-DD)
        const formattedCheckIn = checkInDate;
        const formattedCheckOut = checkOutDate;
        
        // Get location info
        const city = hotel.city || '';
        const hotelName = encodeURIComponent(hotel.name);
        
        // Default number of adults
        const adults = 2;
        
        // Check if we have a hotel chain to determine which site to use
        const hotelChain = (hotel.chain || hotel.name || '').toLowerCase();
        
        // Major hotel chains with reliable links
        if (hotelChain.includes('marriott')) {
            return `https://www.marriott.com/search/default.mi?destinationAddress.destination=${encodeURIComponent(city)}&fromDate=${formattedCheckIn}&toDate=${formattedCheckOut}`;
        }
        if (hotelChain.includes('hilton')) {
            return `https://www.hilton.com/en/search/?query=${encodeURIComponent(city)}&arrivalDate=${formattedCheckIn}&departureDate=${formattedCheckOut}`;
        }
        if (hotelChain.includes('hyatt')) {
            return `https://www.hyatt.com/search/${city}?checkinDate=${formattedCheckIn}&checkoutDate=${formattedCheckOut}&adults=${adults}`;
        }
        if (hotelChain.includes('bestwestern')) {
            return `https://www.bestwestern.com/en_US/book/hotel-search.html?searchParams=${encodeURIComponent(city)}&propertyCode=&checkInDate=${formattedCheckIn}&checkOutDate=${formattedCheckOut}&adults=${adults}`;
        }
        
        // Fallback to simple Google search with just the hotel name
        const searchQuery = encodeURIComponent(hotel.name);
        return `https://www.google.com/search?q=${searchQuery}`;
    };
    
    const handleBookHotel = () => {
        const bookingUrl = generateBookingUrl();
        console.log('Opening booking URL:', bookingUrl);
        window.open(bookingUrl, '_blank');
    };
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
                
                {/* Book Hotel Button */}
                <button 
                    className="book-hotel-btn"
                    onClick={handleBookHotel}
                >
                    Book Hotel
                </button>
            </div>
        </div>
    );
};

export default HotelCard;
