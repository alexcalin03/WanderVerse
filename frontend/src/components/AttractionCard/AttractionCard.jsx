import './AttractionCard.css';

const AttractionCard = ({ attraction }) => {
    // This function creates a Google search URL if the original booking link fails
    const generateFallbackLink = (attractionName) => {
        // Create a Google search query for the attraction
        const searchQuery = encodeURIComponent(`${attractionName} book tickets`);
        return `https://www.google.com/search?q=${searchQuery}`;
    };
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
                    href={attraction.bookingLink || generateFallbackLink(attraction.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="see-details-btn"
                >
                    Find Tickets
                </a>
            </div>
        </div>
    );
};

export default AttractionCard;
